import { State } from 'ts-fsrs';
import {
	LEARNED_MASTERY,
	legacyToFsrs,
	scheduleReview,
	type StoredCard,
} from './scheduler';

const DAY = 86_400_000;
const start = new Date('2026-03-01T09:00:00Z');

function stored(overrides: Partial<StoredCard> = {}): StoredCard {
	return {
		mastery: 0,
		ease: 2.5,
		intervalDays: 0,
		reps: 0,
		lapses: 0,
		stability: null,
		difficulty: null,
		fsrsState: 0,
		learningSteps: 0,
		learnedAt: null,
		lastSeenAt: null,
		nextReviewAt: null,
		...overrides,
	};
}

/** Feed a scheduled result back in as the stored row, the way the service does. */
function asStored(
	card: StoredCard,
	result: ReturnType<typeof scheduleReview>,
	at: Date
): StoredCard {
	return {
		...card,
		mastery: result.mastery,
		intervalDays: result.intervalDays,
		reps: result.reps,
		lapses: result.lapses,
		stability: result.stability,
		difficulty: result.difficulty,
		fsrsState: result.fsrsState,
		learningSteps: result.learningSteps,
		learnedAt: result.learnedAt,
		lastSeenAt: at,
		nextReviewAt: result.nextReviewAt,
	};
}

describe('scheduleReview', () => {
	it('keeps a new card in short learning steps on its first good answer', () => {
		const result = scheduleReview(null, 'good', start);
		expect(result.fsrsState).toBe(State.Learning);
		expect(result.reps).toBe(1);
		expect(result.nextReviewAt.getTime() - start.getTime()).toBeLessThan(DAY);
		expect(result.nextReviewAt.getTime()).toBeGreaterThan(start.getTime());
	});

	it('graduates a new card straight to review on easy', () => {
		const result = scheduleReview(null, 'easy', start);
		expect(result.fsrsState).toBe(State.Review);
		expect(result.intervalDays).toBeGreaterThanOrEqual(1);
	});

	it('grows the interval across successful reviews', () => {
		let card = stored();
		let at = start;
		const intervals: number[] = [];
		for (let i = 0; i < 6; i += 1) {
			const result = scheduleReview(card, 'good', at);
			card = asStored(card, result, at);
			at = result.nextReviewAt;
			if (result.fsrsState === Number(State.Review))
				intervals.push(result.intervalDays);
		}
		expect(intervals.length).toBeGreaterThanOrEqual(3);
		for (let i = 1; i < intervals.length; i += 1) {
			expect(intervals[i]).toBeGreaterThan(intervals[i - 1] ?? 0);
		}
	});

	it('counts a lapse and relearns soon when a review card is forgotten', () => {
		let card = stored();
		let at = start;
		for (let i = 0; i < 4; i += 1) {
			const result = scheduleReview(card, 'good', at);
			card = asStored(card, result, at);
			at = result.nextReviewAt;
		}
		expect(card.fsrsState).toBe(State.Review);
		const forgot = scheduleReview(card, 'again', at);
		expect(forgot.lapses).toBe(card.lapses + 1);
		expect(forgot.fsrsState).toBe(State.Relearning);
		expect(forgot.nextReviewAt.getTime() - at.getTime()).toBeLessThan(DAY);
		expect(forgot.stability).toBeLessThan(card.stability ?? Infinity);
	});

	it('tracks mastery and sets learnedAt once', () => {
		const first = scheduleReview(
			stored({ mastery: LEARNED_MASTERY - 1 }),
			'good',
			start
		);
		expect(first.mastery).toBe(LEARNED_MASTERY);
		expect(first.learnedAt).toEqual(start);

		const later = new Date(start.getTime() + 5 * DAY);
		const again = scheduleReview(
			stored({
				mastery: LEARNED_MASTERY,
				learnedAt: start,
				reps: 3,
				stability: 4,
				difficulty: 5,
				fsrsState: State.Review,
				lastSeenAt: start,
			}),
			'again',
			later
		);
		expect(again.mastery).toBe(LEARNED_MASTERY - 1);
		expect(again.learnedAt).toEqual(start);
	});

	it('clamps mastery between 0 and 5', () => {
		expect(scheduleReview(stored({ mastery: 0 }), 'again', start).mastery).toBe(
			0
		);
		expect(scheduleReview(stored({ mastery: 5 }), 'easy', start).mastery).toBe(
			5
		);
	});
});

describe('legacyToFsrs', () => {
	it('maps SM-2 interval to stability and ease to difficulty', () => {
		const card = legacyToFsrs(
			stored({
				reps: 4,
				intervalDays: 12,
				ease: 2.5,
				lastSeenAt: start,
				nextReviewAt: new Date(start.getTime() + 12 * DAY),
			}),
			start
		);
		expect(card.state).toBe(State.Review);
		expect(card.stability).toBe(12);
		expect(card.difficulty).toBeGreaterThan(3);
		expect(card.difficulty).toBeLessThan(9);
	});

	it('gives a hard card higher difficulty than an easy one', () => {
		const hard = legacyToFsrs(stored({ reps: 2, ease: 1.3 }), start);
		const easy = legacyToFsrs(stored({ reps: 2, ease: 3 }), start);
		expect(hard.difficulty).toBeCloseTo(9);
		expect(easy.difficulty).toBeCloseTo(3);
	});

	it('is used for SM-2 era rows so their next review is scheduled from the old interval', () => {
		const lastSeenAt = start;
		const dueAt = new Date(start.getTime() + 10 * DAY);
		const result = scheduleReview(
			stored({
				reps: 5,
				mastery: 4,
				intervalDays: 10,
				ease: 2.5,
				lastSeenAt,
				nextReviewAt: dueAt,
			}),
			'good',
			dueAt
		);
		expect(result.fsrsState).toBe(State.Review);
		expect(result.intervalDays).toBeGreaterThan(10);
		expect(result.reps).toBe(6);
	});
});
