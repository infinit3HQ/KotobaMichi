import { daysBetween } from '@/learning/streak';

export type NudgeState = {
	remindersEnabled: boolean;
	reminderHour: number;
	weeklyRecap: boolean;
	tzOffsetMinutes: number;
	lastActiveOn: string | null;
	lastRemindedOn: string | null;
	lastRecapOn: string | null;
	streakDays: number;
};

export type LocalClock = { day: string; hour: number; weekday: number };

/** Recaps go out on Sunday from this local hour. */
export const RECAP_HOUR = 18;

/** The learner's local date, hour and weekday (0 is Sunday). */
export function localClock(now: Date, offsetMinutes: number): LocalClock {
	const local = new Date(now.getTime() + offsetMinutes * 60_000);
	return {
		day: local.toISOString().slice(0, 10),
		hour: local.getUTCHours(),
		weekday: local.getUTCDay(),
	};
}

/** One reminder a day, after the chosen hour, only if they have not studied yet today. */
export function shouldRemind(state: NudgeState, clock: LocalClock) {
	if (!state.remindersEnabled || !state.lastActiveOn) return false;
	if (clock.hour < state.reminderHour) return false;
	if (state.lastRemindedOn === clock.day) return false;
	return state.lastActiveOn !== clock.day;
}

/** One recap a week on Sunday evening, for learners who studied in the last seven days. */
export function shouldRecap(state: NudgeState, clock: LocalClock) {
	if (!state.weeklyRecap || !state.lastActiveOn) return false;
	if (clock.weekday !== 0 || clock.hour < RECAP_HOUR) return false;
	if (daysBetween(state.lastActiveOn, clock.day) > 6) return false;
	return !state.lastRecapOn || daysBetween(state.lastRecapOn, clock.day) >= 6;
}
