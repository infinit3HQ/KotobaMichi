import {
	localClock,
	shouldRecap,
	shouldRemind,
	type NudgeState,
} from './nudge-rules';

const base: NudgeState = {
	remindersEnabled: true,
	reminderHour: 19,
	weeklyRecap: true,
	tzOffsetMinutes: 330,
	lastActiveOn: '2026-11-25',
	lastRemindedOn: null,
	lastRecapOn: null,
	streakDays: 4,
};

// 2026-11-26 14:00 UTC is 19:30 in Sri Lanka (UTC+5:30), a Thursday.
const thursdayEvening = new Date('2026-11-26T14:00:00Z');

describe('localClock', () => {
	it('shifts UTC by the learner offset, across midnight', () => {
		expect(localClock(new Date('2026-11-26T20:00:00Z'), 330)).toEqual({
			day: '2026-11-27',
			hour: 1,
			weekday: 5,
		});
	});
});

describe('shouldRemind', () => {
	it('nudges after the chosen hour when the learner has not studied today', () => {
		expect(shouldRemind(base, localClock(thursdayEvening, 330))).toBe(true);
	});

	it('waits until the chosen hour', () => {
		expect(
			shouldRemind(
				{ ...base, reminderHour: 21 },
				localClock(thursdayEvening, 330)
			)
		).toBe(false);
	});

	it('stays quiet once the learner has studied today', () => {
		expect(
			shouldRemind(
				{ ...base, lastActiveOn: '2026-11-26' },
				localClock(thursdayEvening, 330)
			)
		).toBe(false);
	});

	it('sends at most one a day', () => {
		expect(
			shouldRemind(
				{ ...base, lastRemindedOn: '2026-11-26' },
				localClock(thursdayEvening, 330)
			)
		).toBe(false);
	});

	it('never nudges someone who has not started', () => {
		expect(
			shouldRemind(
				{ ...base, lastActiveOn: null },
				localClock(thursdayEvening, 330)
			)
		).toBe(false);
	});

	it('respects the switch', () => {
		expect(
			shouldRemind(
				{ ...base, remindersEnabled: false },
				localClock(thursdayEvening, 330)
			)
		).toBe(false);
	});
});

describe('shouldRecap', () => {
	const sundayEvening = localClock(new Date('2026-11-29T13:00:00Z'), 330);

	it('sends on Sunday evening', () => {
		expect(sundayEvening.weekday).toBe(0);
		expect(shouldRecap(base, sundayEvening)).toBe(true);
	});

	it('does not send on other days', () => {
		expect(shouldRecap(base, localClock(thursdayEvening, 330))).toBe(false);
	});

	it('sends once a week', () => {
		expect(
			shouldRecap({ ...base, lastRecapOn: '2026-11-29' }, sundayEvening)
		).toBe(false);
		expect(
			shouldRecap({ ...base, lastRecapOn: '2026-11-22' }, sundayEvening)
		).toBe(true);
	});

	it('skips learners with no activity in the last week', () => {
		expect(
			shouldRecap({ ...base, lastActiveOn: '2026-11-10' }, sundayEvening)
		).toBe(false);
	});
});
