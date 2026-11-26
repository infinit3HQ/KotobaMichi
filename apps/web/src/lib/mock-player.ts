/** Speeds the practice player offers. The real exam only plays at 1×. */
export const PLAYBACK_RATES = [0.75, 1, 1.25] as const;

export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/** Skip steps, in seconds, for the back and forward buttons. */
export const SEEK_STEPS = [10, 5] as const;

/** The new position after skipping `delta` seconds, kept inside the recording. */
export function seekBy(current: number, delta: number, duration: number) {
  const next = Math.max(0, current + delta);
  return Number.isFinite(duration) ? Math.min(duration, next) : next;
}

/** "m:ss" for a position in the recording, or a placeholder before it has loaded. */
export function formatTrackTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "--:--";
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}
