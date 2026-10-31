import {
	type Card,
	type Grade as FsrsGrade,
	createEmptyCard,
	fsrs,
	generatorParameters,
	Rating,
	State,
} from 'ts-fsrs';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

/** The learner_cards columns the scheduler reads. */
export type StoredCard = {
	mastery: number;
	ease: number;
	intervalDays: number;
	reps: number;
	lapses: number;
	stability: number | null;
	difficulty: number | null;
	fsrsState: number;
	learningSteps: number;
	learnedAt: Date | null;
	lastSeenAt: Date | null;
	nextReviewAt: Date | null;
};

export type ScheduledCard = {
	mastery: number;
	intervalDays: number;
	reps: number;
	lapses: number;
	stability: number;
	difficulty: number;
	fsrsState: number;
	learningSteps: number;
	learnedAt: Date | null;
	nextReviewAt: Date;
};

const RATING: Record<Grade, FsrsGrade> = {
	again: Rating.Again,
	hard: Rating.Hard,
	good: Rating.Good,
	easy: Rating.Easy,
};

/** A card counts as learned once mastery reaches this value. */
export const LEARNED_MASTERY = 3;

// Fuzz spreads due dates so cards learned together don't all come back on the same day.
const scheduler = fsrs(
	generatorParameters({ enable_fuzz: true, request_retention: 0.9 })
);

/**
 * Cards reviewed before the FSRS switch have SM-2 fields only.
 * Map them onto an FSRS review card: the old interval becomes stability,
 * and ease (1.3 to 3.0) maps onto difficulty (9 down to 3).
 */
export function legacyToFsrs(card: StoredCard, now: Date): Card {
	const last = card.lastSeenAt ?? now;
	const ease = Math.min(3, Math.max(1.3, card.ease));
	const difficulty = 9 - ((ease - 1.3) / 1.7) * 6;
	return {
		due: card.nextReviewAt ?? now,
		stability: Math.max(card.intervalDays, 1),
		difficulty,
		elapsed_days: 0,
		scheduled_days: card.intervalDays,
		learning_steps: 0,
		reps: card.reps,
		lapses: card.lapses,
		state: State.Review,
		last_review: last,
	};
}

export function toFsrsCard(card: StoredCard | null, now: Date): Card {
	if (!card || card.reps === 0) return createEmptyCard(now);
	if (card.stability == null || card.difficulty == null) {
		return legacyToFsrs(card, now);
	}
	return {
		due: card.nextReviewAt ?? now,
		stability: card.stability,
		difficulty: card.difficulty,
		elapsed_days: 0,
		scheduled_days: card.intervalDays,
		learning_steps: card.learningSteps,
		reps: card.reps,
		lapses: card.lapses,
		state: card.fsrsState,
		last_review: card.lastSeenAt ?? now,
	};
}

function nextMastery(mastery: number, grade: Grade) {
	if (grade === 'again') return Math.max(0, mastery - 1);
	if (grade === 'good') return Math.min(5, mastery + 1);
	if (grade === 'easy') return Math.min(5, mastery + 2);
	return mastery;
}

export function scheduleReview(
	card: StoredCard | null,
	grade: Grade,
	now: Date
): ScheduledCard {
	const result = scheduler.next(toFsrsCard(card, now), now, RATING[grade]);
	const next = result.card;
	const mastery = nextMastery(card?.mastery ?? 0, grade);
	return {
		mastery,
		intervalDays: next.scheduled_days,
		reps: next.reps,
		lapses: next.lapses,
		stability: next.stability,
		difficulty: next.difficulty,
		fsrsState: next.state,
		learningSteps: next.learning_steps,
		learnedAt: card?.learnedAt ?? (mastery >= LEARNED_MASTERY ? now : null),
		nextReviewAt: next.due,
	};
}
