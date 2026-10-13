import { Injectable } from '@nestjs/common';
import { and, asc, eq, lte } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DbService } from '@/db/drizzle.service';
import { learnerCards, learnerState, type LearnerBookmark } from '@/db/schema';
import { QueueQueryDto, ReviewDto, SavePlaceDto } from './dto/review.dto';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
type Grade = ReviewDto['grade'];

@Injectable()
export class LearningService {
	constructor(private dbService: DbService) {}

	private get db() {
		return this.dbService.db;
	}

	async summary(userId: string, day: string) {
		const [state, cards] = await Promise.all([
			this.db.query.learnerState.findFirst({
				where: eq(learnerState.userId, userId),
			}),
			this.db
				.select({
					level: learnerCards.level,
					learnedAt: learnerCards.learnedAt,
					nextReviewAt: learnerCards.nextReviewAt,
					lastSeenDay: learnerCards.lastSeenDay,
				})
				.from(learnerCards)
				.where(eq(learnerCards.userId, userId)),
		]);

		const now = Date.now();
		const byLevel = new Map<string, { seen: number; learned: number; due: number; today: number }>();
		let studiedToday = 0;
		let dueNow = 0;
		for (const card of cards) {
			const bucket = byLevel.get(card.level) ?? { seen: 0, learned: 0, due: 0, today: 0 };
			bucket.seen += 1;
			if (card.learnedAt) bucket.learned += 1;
			if (card.nextReviewAt && card.nextReviewAt.getTime() <= now) {
				bucket.due += 1;
				dueNow += 1;
			}
			if (card.lastSeenDay === day) {
				bucket.today += 1;
				studiedToday += 1;
			}
			byLevel.set(card.level, bucket);
		}

		return {
			streak: this.liveStreak(state?.streakDays ?? 0, state?.lastActiveOn ?? null, day),
			studiedToday,
			dueNow,
			place: state
				? {
						level: state.level,
						mode: state.mode,
						itemKey: state.itemKey,
						cursor: state.cursorIndex,
					}
				: null,
			bookmarks: state?.bookmarks ?? {},
			levels: LEVELS.map((level) => {
				const row = byLevel.get(level);
				return {
					level,
					seen: Number(row?.seen || 0),
					learned: Number(row?.learned || 0),
					due: Number(row?.due || 0),
				};
			}),
		};
	}

	async queue(userId: string, query: QueueQueryDto) {
		const now = new Date();
		const due = await this.db
			.select({ itemKey: learnerCards.itemKey })
			.from(learnerCards)
			.where(
				and(
					eq(learnerCards.userId, userId),
					eq(learnerCards.level, query.level),
					lte(learnerCards.nextReviewAt, now)
				)
			)
			.orderBy(asc(learnerCards.nextReviewAt))
			.limit(40);

		return { due: due.map((row) => row.itemKey) };
	}

	async review(userId: string, dto: ReviewDto) {
		const now = new Date();
		const existing = await this.db.query.learnerCards.findFirst({
			where: and(
				eq(learnerCards.userId, userId),
				eq(learnerCards.itemKey, dto.itemKey)
			),
		});

		const scheduled = this.schedule(
			{
				mastery: existing?.mastery ?? 0,
				ease: existing?.ease ?? 2.5,
				intervalDays: existing?.intervalDays ?? 0,
				learnedAt: existing?.learnedAt ?? null,
			},
			dto.grade,
			now
		);

		if (existing) {
			await this.db
				.update(learnerCards)
				.set({
					level: dto.level,
					kind: dto.kind ?? existing.kind,
					mastery: scheduled.mastery,
					ease: scheduled.ease,
					intervalDays: scheduled.intervalDays,
					reps: existing.reps + 1,
					lapses: existing.lapses + (dto.grade === 'again' ? 1 : 0),
					lastGrade: dto.grade,
					learnedAt: scheduled.learnedAt,
					lastSeenAt: now,
					lastSeenDay: dto.day,
					nextReviewAt: scheduled.nextReviewAt,
				})
				.where(eq(learnerCards.id, existing.id));
		} else {
			await this.db.insert(learnerCards).values({
				id: uuidv7(),
				userId,
				itemKey: dto.itemKey,
				kind: dto.kind ?? 'word',
				level: dto.level,
				mastery: scheduled.mastery,
				ease: scheduled.ease,
				intervalDays: scheduled.intervalDays,
				reps: 1,
				lapses: dto.grade === 'again' ? 1 : 0,
				lastGrade: dto.grade,
				learnedAt: scheduled.learnedAt,
				lastSeenAt: now,
				lastSeenDay: dto.day,
				nextReviewAt: scheduled.nextReviewAt,
			});
		}

		const streak = await this.touchStreak(userId, dto.day);
		return { ...scheduled, streak };
	}

	async savePlace(userId: string, dto: SavePlaceDto) {
		const current = await this.db.query.learnerState.findFirst({
			where: eq(learnerState.userId, userId),
		});
		const bookmarks: Record<string, LearnerBookmark> = {
			...(current?.bookmarks ?? {}),
			[dto.level]: {
				mode: dto.mode,
				itemKey: dto.itemKey ?? null,
				cursor: dto.cursor,
			},
		};
		const values = {
			level: dto.level,
			mode: dto.mode,
			itemKey: dto.itemKey ?? null,
			cursorIndex: dto.cursor,
			bookmarks,
		};
		if (current) {
			await this.db
				.update(learnerState)
				.set(values)
				.where(eq(learnerState.userId, userId));
		} else {
			await this.db.insert(learnerState).values({
				userId,
				streakDays: 0,
				...values,
			});
		}
		return { ok: true as const };
	}

	private async touchStreak(userId: string, day: string) {
		const current = await this.db.query.learnerState.findFirst({
			where: eq(learnerState.userId, userId),
		});
		const streak = this.nextStreak(current?.streakDays ?? 0, current?.lastActiveOn ?? null, day);
		if (current) {
			if (current.lastActiveOn !== day || current.streakDays !== streak) {
				await this.db
					.update(learnerState)
					.set({ streakDays: streak, lastActiveOn: day })
					.where(eq(learnerState.userId, userId));
			}
		} else {
			await this.db.insert(learnerState).values({
				userId,
				streakDays: streak,
				lastActiveOn: day,
			});
		}
		return streak;
	}

	private liveStreak(streak: number, lastActiveOn: string | null, day: string) {
		if (!lastActiveOn) return 0;
		if (lastActiveOn === day || lastActiveOn === this.shiftDay(day, -1)) return streak;
		return 0;
	}

	private nextStreak(streak: number, lastActiveOn: string | null, day: string) {
		if (lastActiveOn === day) return Math.max(streak, 1);
		if (lastActiveOn === this.shiftDay(day, -1)) return Math.max(streak, 0) + 1;
		return 1;
	}

	private shiftDay(day: string, delta: number) {
		const year = Number(day.slice(0, 4));
		const month = Number(day.slice(5, 7));
		const date = Number(day.slice(8, 10));
		const value = new Date(Date.UTC(year, month - 1, date));
		value.setUTCDate(value.getUTCDate() + delta);
		return value.toISOString().slice(0, 10);
	}

	private schedule(
		card: {
			mastery: number;
			ease: number;
			intervalDays: number;
			learnedAt: Date | null;
		},
		grade: Grade,
		now: Date
	) {
		let mastery = card.mastery;
		let ease = card.ease;
		let intervalDays = card.intervalDays;
		let next = new Date(now);

		if (grade === 'again') {
			mastery = Math.max(0, mastery - 1);
			ease = Math.max(1.3, ease - 0.2);
			intervalDays = 0;
			next = new Date(now.getTime() + 10 * 60 * 1000);
		} else if (grade === 'hard') {
			ease = Math.max(1.3, ease - 0.15);
			intervalDays = Math.max(1, Math.round(intervalDays * 1.2) || 1);
			next = new Date(now.getTime() + intervalDays * 86_400_000);
		} else if (grade === 'good') {
			mastery = Math.min(5, mastery + 1);
			intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * ease));
			next = new Date(now.getTime() + intervalDays * 86_400_000);
		} else {
			mastery = Math.min(5, mastery + 2);
			ease = Math.min(3, ease + 0.15);
			intervalDays = intervalDays === 0 ? 4 : Math.max(1, Math.round(intervalDays * ease * 1.3));
			next = new Date(now.getTime() + intervalDays * 86_400_000);
		}

		const learnedAt =
			card.learnedAt ?? (mastery >= 3 ? now : null);

		return { mastery, ease, intervalDays, nextReviewAt: next, learnedAt };
	}
}
