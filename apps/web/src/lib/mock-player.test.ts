import { describe, expect, it } from "vitest";
import { formatTrackTime, PLAYBACK_RATES, seekBy } from "@/lib/mock-player";

describe("seekBy", () => {
  it("moves forward and back by the step", () => {
    expect(seekBy(30, 10, 120)).toBe(40);
    expect(seekBy(30, -5, 120)).toBe(25);
  });

  it("stays inside the recording", () => {
    expect(seekBy(3, -10, 120)).toBe(0);
    expect(seekBy(115, 10, 120)).toBe(120);
  });

  it("only clamps the start while the length is unknown", () => {
    expect(seekBy(3, 10, Number.NaN)).toBe(13);
    expect(seekBy(3, -10, Number.NaN)).toBe(0);
  });
});

describe("formatTrackTime", () => {
  it("shows minutes and seconds", () => {
    expect(formatTrackTime(0)).toBe("0:00");
    expect(formatTrackTime(65.9)).toBe("1:05");
    expect(formatTrackTime(3000)).toBe("50:00");
  });

  it("shows a placeholder before the length is known", () => {
    expect(formatTrackTime(Number.NaN)).toBe("--:--");
  });
});

describe("PLAYBACK_RATES", () => {
  it("includes normal speed", () => {
    expect(PLAYBACK_RATES).toContain(1);
  });
});
