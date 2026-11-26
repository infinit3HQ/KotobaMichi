import { describe, expect, it } from "vitest";
import {
  canPause,
  isPaused,
  modeFromSave,
  pauseClock,
  remainingMs,
  resumeClock,
  type SectionClock,
} from "@/lib/mock-clock";

const MINUTE = 60_000;

describe("remainingMs", () => {
  it("counts down from the section length while running", () => {
    const clock: SectionClock = { startedAt: 0, pausedAt: null };
    expect(remainingMs(30, clock, 10 * MINUTE)).toBe(20 * MINUTE);
  });

  it("freezes at the moment the clock was paused", () => {
    const clock: SectionClock = { startedAt: 0, pausedAt: 5 * MINUTE };
    expect(remainingMs(30, clock, 25 * MINUTE)).toBe(25 * MINUTE);
  });
});

describe("pauseClock / resumeClock", () => {
  it("does not charge the paused stretch to the section", () => {
    const running: SectionClock = { startedAt: 0, pausedAt: null };
    const paused = pauseClock(running, 5 * MINUTE);
    const resumed = resumeClock(paused, 15 * MINUTE);
    expect(isPaused(resumed)).toBe(false);
    expect(remainingMs(30, resumed, 15 * MINUTE)).toBe(25 * MINUTE);
  });

  it("leaves the original clock untouched", () => {
    const running: SectionClock = { startedAt: 0, pausedAt: null };
    pauseClock(running, MINUTE);
    expect(running.pausedAt).toBeNull();
  });

  it("keeps the first pause time when paused twice", () => {
    const paused = pauseClock({ startedAt: 0, pausedAt: null }, MINUTE);
    expect(pauseClock(paused, 2 * MINUTE)).toEqual(paused);
  });

  it("is a no-op to resume a running clock", () => {
    const running: SectionClock = { startedAt: 100, pausedAt: null };
    expect(resumeClock(running, 500)).toEqual(running);
  });
});

describe("canPause", () => {
  it("only lets practice sittings pause", () => {
    expect(canPause("practice")).toBe(true);
    expect(canPause("strict")).toBe(false);
  });
});

describe("modeFromSave", () => {
  it("treats saves from before modes existed as strict", () => {
    expect(modeFromSave(undefined)).toBe("strict");
    expect(modeFromSave("something-else")).toBe("strict");
    expect(modeFromSave("practice")).toBe("practice");
  });
});
