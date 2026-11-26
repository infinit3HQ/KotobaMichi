import {
	advanceStreak,
	daysBetween,
	liveStreak,
	MAX_FREEZES,
	shiftDay,
} from './streak';

describe('daysBetween', () => {
	it('counts calendar days across a month end', () => {
		expect(daysBetween('2026-11-30', '2026-12-02')).toBe(2);
	});

	it('is negative when the second day is earlier', () => {
		expect(daysBetween('2026-12-02', '2026-12-01')).toBe(-1);
	});
});

describe('shiftDay', () => {
	it('moves across a year end', () => {
		expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01');
	});
});

describe('advanceStreak', () => {
	const base = { streak: 4, lastActiveOn: '2026-11-25', freezes: 0 };

	it('starts at 1 for a first study day', () => {
		expect(
			advanceStreak({ streak: 0, lastActiveOn: null, freezes: 0 }, '2026-11-26')
		).toEqual({ streak: 1, freezes: 0, usedFreezes: 0 });
	});

	it('keeps the count on a second review the same day', () => {
		expect(
			advanceStreak({ ...base, lastActiveOn: '2026-11-26' }, '2026-11-26')
		).toEqual({ streak: 4, freezes: 0, usedFreezes: 0 });
	});

	it('adds a day after studying yesterday', () => {
		expect(advanceStreak(base, '2026-11-26').streak).toBe(5);
	});

	it('resets after a missed day with no freezes', () => {
		expect(advanceStreak(base, '2026-11-27').streak).toBe(1);
	});

	it('spends a freeze to cover one missed day', () => {
		expect(advanceStreak({ ...base, freezes: 1 }, '2026-11-27')).toEqual({
			streak: 5,
			freezes: 0,
			usedFreezes: 1,
		});
	});

	it('resets when the gap is longer than the freezes held', () => {
		expect(advanceStreak({ ...base, freezes: 2 }, '2026-11-29')).toEqual({
			streak: 1,
			freezes: 2,
			usedFreezes: 0,
		});
	});

	it('earns a freeze on every seventh day', () => {
		expect(
			advanceStreak(
				{ streak: 6, lastActiveOn: '2026-11-25', freezes: 0 },
				'2026-11-26'
			)
		).toEqual({ streak: 7, freezes: 1, usedFreezes: 0 });
	});

	it('never holds more than the cap', () => {
		expect(
			advanceStreak(
				{ streak: 13, lastActiveOn: '2026-11-25', freezes: MAX_FREEZES },
				'2026-11-26'
			).freezes
		).toBe(MAX_FREEZES);
	});
});

describe('liveStreak', () => {
	it('is alive when the learner studied yesterday', () => {
		expect(liveStreak(5, '2026-11-25', 0, '2026-11-26')).toEqual({
			streak: 5,
			freezesNeeded: 0,
		});
	});

	it('is alive while held freezes cover the missed days', () => {
		expect(liveStreak(5, '2026-11-24', 1, '2026-11-26')).toEqual({
			streak: 5,
			freezesNeeded: 1,
		});
	});

	it('is broken when the missed days outnumber the freezes', () => {
		expect(liveStreak(5, '2026-11-23', 1, '2026-11-26').streak).toBe(0);
	});

	it('is zero before any study', () => {
		expect(liveStreak(0, null, 0, '2026-11-26').streak).toBe(0);
	});
});
