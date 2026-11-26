/** A learner holds at most this many streak freezes. */
export const MAX_FREEZES = 2;
/** One freeze is earned each time the streak reaches a multiple of this. */
export const FREEZE_EVERY = 7;

export type StreakState = {
	streak: number;
	lastActiveOn: string | null;
	freezes: number;
};

function toUtc(day: string) {
	return Date.UTC(
		Number(day.slice(0, 4)),
		Number(day.slice(5, 7)) - 1,
		Number(day.slice(8, 10))
	);
}

/** Whole calendar days from `from` to `to`, both `YYYY-MM-DD`. */
export function daysBetween(from: string, to: string) {
	return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function shiftDay(day: string, delta: number) {
	return new Date(toUtc(day) + delta * 86_400_000).toISOString().slice(0, 10);
}

/**
 * The streak after studying on `day`.
 * Missed days are covered by freezes when the learner holds enough of them;
 * otherwise the streak starts again at 1.
 */
export function advanceStreak(state: StreakState, day: string) {
	const freezes = Math.max(0, state.freezes);
	if (!state.lastActiveOn) {
		return { streak: 1, freezes, usedFreezes: 0 };
	}
	const gap = daysBetween(state.lastActiveOn, day);
	if (gap <= 0) {
		return { streak: Math.max(state.streak, 1), freezes, usedFreezes: 0 };
	}
	const missed = gap - 1;
	if (missed > freezes) {
		return { streak: 1, freezes, usedFreezes: 0 };
	}
	const streak = Math.max(state.streak, 0) + 1;
	const earned = streak % FREEZE_EVERY === 0 ? 1 : 0;
	return {
		streak,
		freezes: Math.min(MAX_FREEZES, freezes - missed + earned),
		usedFreezes: missed,
	};
}

/**
 * The streak as it stands on `day`, before any study that day.
 * `freezesNeeded` is how many freezes the next study day will spend.
 */
export function liveStreak(
	streak: number,
	lastActiveOn: string | null,
	freezes: number,
	day: string
) {
	if (!lastActiveOn) return { streak: 0, freezesNeeded: 0 };
	const missed = Math.max(0, daysBetween(lastActiveOn, day) - 1);
	if (missed > freezes) return { streak: 0, freezesNeeded: 0 };
	return { streak, freezesNeeded: missed };
}
