/** How a sitting runs: the real exam rules, or a practice run that can pause. */
export type MockMode = "strict" | "practice";

export const DEFAULT_MODE: MockMode = "strict";

/**
 * A section clock. `startedAt` moves forward by every paused stretch on resume,
 * so `now - startedAt` is always the time actually spent in the section.
 */
export type SectionClock = {
  startedAt: number;
  /** When the clock was paused, or null while it runs. */
  pausedAt: number | null;
};

export function canPause(mode: MockMode) {
  return mode === "practice";
}

/** Saves from before modes existed carry none; those sittings ran on strict rules. */
export function modeFromSave(value: unknown): MockMode {
  return value === "practice" ? "practice" : "strict";
}

export function isPaused(clock: SectionClock) {
  return clock.pausedAt != null;
}

export function remainingMs(minutes: number, clock: SectionClock, now: number) {
  const at = clock.pausedAt ?? now;
  return minutes * 60_000 - (at - clock.startedAt);
}

export function pauseClock(clock: SectionClock, now: number): SectionClock {
  if (isPaused(clock)) return clock;
  return { ...clock, pausedAt: now };
}

export function resumeClock(clock: SectionClock, now: number): SectionClock {
  if (clock.pausedAt == null) return clock;
  return { startedAt: clock.startedAt + (now - clock.pausedAt), pausedAt: null };
}
