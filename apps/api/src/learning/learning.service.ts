import { Injectable } from '@nestjs/common';
import { and, asc, eq, lte } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { DbService } from '@/db/drizzle.service';
import { learnerCards, learnerState, type LearnerBookmark } from '@/db/schema';
import {
	LEVELS,
	QueueQueryDto,
	ReviewBatchDto,
	ReviewDto,
	SaveGoalDto,
	SavePlaceDto,
	type CardKind,
	type Level,
} from './dto/review.dto';
import { scheduleReview } from './scheduler';
import { advanceStreak, liveStreak } from './streak';

/** Guest reviews older than this are dropped on sync. */
const SYNC_WINDOW_MS = 180 * 86_400_000;
/** Allow a device clock to run a little ahead of the server. */
const CLOCK_SKEW_MS = 5 * 60_000;

type StateRow = typeof learnerState.$inferSelect;

export type NewCard = { itemKey: string; level: Level; kind: CardKind };

type LevelBucket = { seen: number; learned: number; due: number };

@Injectable()
export class LearningService {
	constructor(private dbService: DbService) {}

	private get db() {
		return this.dbService.db;
	}

	async summary(userId: string, day: string) {
		const [state, cards] = await Promise.all([
			this.findState(userId),
			this.db
				.select({
					kind: learnerCards.kind,
					level: learnerCards.level,
					learnedAt: learnerCards.learnedAt,
					nextReviewAt: learnerCards.nextReviewAt,
					lastSeenDay: learnerCards.lastSeenDay,
				})
				.from(learnerCards)
				.where(eq(learnerCards.userId, userId)),
		]);

		const now = Date.now();
		const byLevel = new Map<string, LevelBucket>();
		let studiedToday = 0;
		let dueNow = 0;
		let mistakesDue = 0;
		let mistakesTotal = 0;
		for (const card of cards) {
			const isDue =
				card.nextReviewAt != null && card.nextReviewAt.getTime() <= now;
			if (card.lastSeenDay === day) studiedToday += 1;
			if (card.kind === 'mock') {
				mistakesTotal += 1;
				if (isDue) mistakesDue += 1;
				continue;
			}
			const bucket = byLevel.get(card.level) ?? {
				seen: 0,
				learned: 0,
				due: 0,
			};
			byLevel.set(card.level, {
				seen: bucket.seen + 1,
				learned: bucket.learned + (card.learnedAt ? 1 : 0),
				due: bucket.due + (isDue ? 1 : 0),
			});
			if (isDue) dueNow += 1;
		}

		const streak = liveStreak(
			state?.streakDays ?? 0,
			state?.lastActiveOn ?? null,
			state?.streakFreezes ?? 0,
			day
		);

		return {
			streak: streak.streak,
			freezes: state?.streakFreezes ?? 0,
			freezesNeeded: streak.freezesNeeded,
			studiedToday,
			dueNow,
			mistakesDue,
			mistakesTotal,
			goal: this.presentGoal(state),
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
					seen: row?.seen ?? 0,
					learned: row?.learned ?? 0,
					due: row?.due ?? 0,
				};
			}),
		};
	}

	async queue(userId: string, query: QueueQueryDto) {
		const now = new Date();
		const kind = query.kind ?? 'word';
		const filters = [
			eq(learnerCards.userId, userId),
			eq(learnerCards.kind, kind),
			lte(learnerCards.nextReviewAt, now),
		];
		if (query.level) filters.push(eq(learnerCards.level, query.level));
		const due = await this.db
			.select({ itemKey: learnerCards.itemKey })
			.from(learnerCards)
			.where(and(...filters))
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

	/**
	 * Adds cards that are due straight away, such as questions missed on a mock.
	 * Cards the learner already has are left alone so their schedule is kept.
	 */
	async addCards(userId: string, cards: readonly NewCard[]) {
		if (cards.length === 0) return { added: 0, existing: 0 };
		const now = new Date();
		const inserted = await this.db
			.insert(learnerCards)
			.values(
				cards.map(card => ({
					id: uuidv7(),
					userId,
					itemKey: card.itemKey,
					kind: card.kind,
					level: card.level,
					nextReviewAt: now,
				}))
			)
			.onConflictDoNothing({
				target: [learnerCards.userId, learnerCards.itemKey],
			})
			.returning({ id: learnerCards.id });
		return { added: inserted.length, existing: cards.length - inserted.length };
	}

	async saveGoal(userId: string, dto: SaveGoalDto) {
		const values: Partial<typeof learnerState.$inferInsert> = {};
		if (dto.targetLevel !== undefined) values.targetLevel = dto.targetLevel;
		if (dto.examDate !== undefined) values.examDate = dto.examDate;
		if (dto.dailyGoal !== undefined) values.dailyGoal = dto.dailyGoal;
		if (dto.remindersEnabled !== undefined)
			values.remindersEnabled = dto.remindersEnabled;
		if (dto.reminderHour !== undefined) values.reminderHour = dto.reminderHour;
		if (dto.weeklyRecap !== undefined) values.weeklyRecap = dto.weeklyRecap;
		if (dto.tzOffsetMinutes !== undefined)
			values.tzOffsetMinutes = dto.tzOffsetMinutes;

		const [row] = await this.db
			.insert(learnerState)
			.values({ userId, ...values })
			.onConflictDoUpdate({ target: learnerState.userId, set: values })
			.returning();
		return this.presentGoal(row ?? null);
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
		const current = await this.findState(userId);
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

	private findState(userId: string) {
		return this.db.query.learnerState.findFirst({
			where: eq(learnerState.userId, userId),
		});
	}

	private presentGoal(state: StateRow | null | undefined) {
		return {
			targetLevel: (state?.targetLevel as Level | null) ?? null,
			examDate: state?.examDate ?? null,
			dailyGoal: state?.dailyGoal ?? 20,
			remindersEnabled: state?.remindersEnabled ?? false,
			reminderHour: state?.reminderHour ?? 19,
			weeklyRecap: state?.weeklyRecap ?? false,
		};
	}

	private async touchStreak(userId: string, day: string) {
		const current = await this.findState(userId);
		// A day before the last active day can't extend or reset the streak.
		if (current?.lastActiveOn && day < current.lastActiveOn) {
			return current.streakDays;
		}
		const next = advanceStreak(
			{
				streak: current?.streakDays ?? 0,
				lastActiveOn: current?.lastActiveOn ?? null,
				freezes: current?.streakFreezes ?? 0,
			},
			day
		);
		const values = {
			streakDays: next.streak,
			streakFreezes: next.freezes,
			lastActiveOn: day,
		};
		if (current) {
			if (
				current.lastActiveOn !== day ||
				current.streakDays !== next.streak ||
				current.streakFreezes !== next.freezes
			) {
				await this.db
					.update(learnerState)
					.set(values)
					.where(eq(learnerState.userId, userId));
			}
		} else {
			await this.db.insert(learnerState).values({ userId, ...values });
		}
		return next.streak;
	}
}
