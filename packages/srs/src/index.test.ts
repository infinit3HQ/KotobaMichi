import { createEmptyCard, Rating } from 'ts-fsrs';
import { describe, expect, it } from 'vitest';
import { createScheduler, GRADES, RATING, SCHEDULER_PARAMS } from './index';

describe('@kotobamichi/srs', () => {
	it('maps every grade to its FSRS rating', () => {
		expect(GRADES.map(grade => RATING[grade])).toEqual([
			Rating.Again,
			Rating.Hard,
			Rating.Good,
			Rating.Easy,
		]);
	});

	it('builds a scheduler with the shared parameters', () => {
		const scheduler = createScheduler();
		expect(scheduler.parameters.request_retention).toBe(
			SCHEDULER_PARAMS.request_retention
		);
		expect(scheduler.parameters.enable_fuzz).toBe(SCHEDULER_PARAMS.enable_fuzz);
	});

	it('schedules a good review later than an again review', () => {
		const now = new Date('2026-01-01T00:00:00Z');
		const card = createEmptyCard(now);
		const scheduler = createScheduler();
		const again = scheduler.next(card, now, RATING.again).card.due;
		const good = scheduler.next(card, now, RATING.good).card.due;
		expect(good.getTime()).toBeGreaterThan(again.getTime());
	});

	it('cannot be mutated by consumers', () => {
		expect(Object.isFrozen(SCHEDULER_PARAMS)).toBe(true);
	});
});
