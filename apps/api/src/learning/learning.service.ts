import { Injectable } from '@nestjs/common';
import { and, asc, eq, lte } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DbService } from '@/db/drizzle.service';
import { learnerCards, learnerState, type LearnerBookmark } from '@/db/schema';
import {
	QueueQueryDto,
	ReviewBatchDto,
	ReviewDto,
	SavePlaceDto,
} from './dto/review.dto';
import { scheduleReview } from './scheduler';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
/** Guest reviews older than this are dropped on sync. */
const SYNC_WINDOW_MS = 180 * 86_400_000;
/** Allow a device clock to run a little ahead of the server. */
const CLOCK_SKEW_MS = 5 * 60_000;

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
		const byLevel = new Map<
			string,
			{ seen: number; learned: number; due: number; today: number }
		>();
		let studiedToday = 0;
		let dueNow = 0;
		for (const card of cards) {
			const bucket = byLevel.get(card.level) ?? {
				seen: 0,
				learned: 0,
				due: 0,
				today: 0,
			};
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
			streak: this.liveStreak(
				state?.streakDays ?? 0,
				state?.lastActiveOn ?? null,
				day
			),
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
			levels: LEVELS.map(level => {
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

		return { due: due.map(row => row.itemKey) };
	}

	async review(userId: string, dto: ReviewDto) {
		const now = new Date();
		const scheduled = await this.applyReview(userId, dto, now);
		const streak = await this.touchStreak(userId, dto.day);
		return { ...scheduled, streak };
	}

	/**
	 * Replays reviews made while signed out, oldest first.
	 * Reviews dated in the future, older than the sync window, or older than the
	 * card's last server review are skipped so a stale device can't rewind a card.
	 */
	async reviewBatch(userId: string, dto: ReviewBatchDto) {
		const now = Date.now();
		const ordered = [...dto.reviews].sort(
			(a, b) => a.reviewedAt - b.reviewedAt
		);
		let applied = 0;
		let skipped = 0;
		const days = new Set<string>();
		for (const review of ordered) {
			if (
				review.reviewedAt > now + CLOCK_SKEW_MS ||
				review.reviewedAt < now - SYNC_WINDOW_MS
			) {
				skipped += 1;
				continue;
			}
			const result = await this.applyReview(
				userId,
				review,
				new Date(Math.min(review.reviewedAt, now))
			);
			if (result) {
				applied += 1;
				days.add(review.day);
			} else {
				skipped += 1;
			}
		}
		let streak: number | null = null;
		for (const day of [...days].sort()) {
			streak = await this.touchStreak(userId, day);
		}
		return { applied, skipped, streak };
	}

	/** Returns null when the card already has a later review than `at`. */
	private async applyReview(userId: string, dto: ReviewDto, at: Date) {
		const existing = await this.db.query.learnerCards.findFirst({
			where: and(
				eq(learnerCards.userId, userId),
				eq(learnerCards.itemKey, dto.itemKey)
			),
		});
		if (existing?.lastSeenAt && existing.lastSeenAt.getTime() > at.getTime()) {
			return null;
		}

		const scheduled = scheduleReview(existing ?? null, dto.grade, at);
		const values = {
			level: dto.level,
			mastery: scheduled.mastery,
			intervalDays: scheduled.intervalDays,
			reps: scheduled.reps,
			lapses: scheduled.lapses,
			stability: scheduled.stability,
			difficulty: scheduled.difficulty,
			fsrsState: scheduled.fsrsState,
			learningSteps: scheduled.learningSteps,
			lastGrade: dto.grade,
			learnedAt: scheduled.learnedAt,
			lastSeenAt: at,
			lastSeenDay: dto.day,
			nextReviewAt: scheduled.nextReviewAt,
		};

		if (existing) {
			await this.db
				.update(learnerCards)
				.set({ ...values, kind: dto.kind ?? existing.kind })
				.where(eq(learnerCards.id, existing.id));
		} else {
			await this.db.insert(learnerCards).values({
				...values,
				id: uuidv7(),
				userId,
				itemKey: dto.itemKey,
				kind: dto.kind ?? 'word',
			});
		}

		return {
			mastery: scheduled.mastery,
			intervalDays: scheduled.intervalDays,
			nextReviewAt: scheduled.nextReviewAt,
			learnedAt: scheduled.learnedAt,
		};
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
		// A day before the last active day can't extend or reset the streak.
		if (current?.lastActiveOn && day < current.lastActiveOn) {
			return current.streakDays;
		}
		const streak = this.nextStreak(
			current?.streakDays ?? 0,
			current?.lastActiveOn ?? null,
			day
		);
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
		if (lastActiveOn === day || lastActiveOn === this.shiftDay(day, -1))
			return streak;
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
}
