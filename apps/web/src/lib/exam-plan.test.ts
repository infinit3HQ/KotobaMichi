import { describe, expect, it } from "vitest";
import {
  daysUntil,
  drillForSection,
  examLabel,
  nextMockIn,
  predictPass,
  scoreTrend,
  upcomingSittings,
  wordPace,
  type PlanAttempt,
} from "./exam-plan";

const DAY = 86_400_000;

function sitting(examId: string, finishedAt: number, language: number, reading: number, listening: number): PlanAttempt {
  return {
    examId,
    status: "finished",
    finishedAt,
    scores: [
      { id: "language", title: "言語知識", correct: language, total: 60 },
      { id: "reading", title: "読解", correct: reading, total: 60 },
      { id: "listening", title: "聴解", correct: listening, total: 60 },
    ],
  };
}

describe("upcomingSittings", () => {
  it("returns the first Sundays of December and July", () => {
    expect(upcomingSittings("2026-11-26")).toEqual(["2026-12-06", "2027-07-04"]);
  });

  it("includes a sitting that is today", () => {
    expect(upcomingSittings("2026-12-06", 1)).toEqual(["2026-12-06"]);
  });
});

describe("daysUntil", () => {
  it("counts whole days", () => {
    expect(daysUntil("2026-12-06", "2026-11-26")).toBe(10);
  });
});

describe("examLabel", () => {
  it("names the level and sitting", () => {
    expect(examLabel("n3-2024-12")).toBe("N3 · December 2024");
  });
});

describe("predictPass", () => {
  it("averages the last three sittings at the level", () => {
    const attempts = [
      sitting("n3-2010-07", 1 * DAY, 0, 0, 0),
      sitting("n3-2024-12", 2 * DAY, 40, 30, 20),
      sitting("n3-2024-07", 3 * DAY, 40, 30, 20),
      sitting("n3-2023-12", 4 * DAY, 40, 30, 20),
      sitting("n2-2024-12", 5 * DAY, 0, 0, 0),
    ];
    const result = predictPass(attempts, "N3");
    expect(result?.sittings).toBe(3);
    expect(result?.total).toBe(90);
    expect(result?.passes).toBe(false);
    expect(result?.weakest).toBe("listening");
  });

  it("fails a section under 19 even when the total passes", () => {
    const result = predictPass([sitting("n3-2024-12", DAY, 60, 60, 10)], "N3");
    expect(result?.total).toBe(130);
    expect(result?.passes).toBe(false);
  });

  it("has nothing to say for levels without mocks", () => {
    expect(predictPass([], "N5")).toBeNull();
  });
});

describe("scoreTrend", () => {
  it("lists totals oldest first", () => {
    const trend = scoreTrend([sitting("n3-2024-12", 2 * DAY, 60, 60, 60), sitting("n3-2024-07", DAY, 30, 30, 30)], "N3");
    expect(trend.map((t) => t.total)).toEqual([90, 180]);
  });
});

describe("nextMockIn", () => {
  it("is due now with no sittings", () => {
    expect(nextMockIn([], "N3")).toBe(0);
  });

  it("waits two weeks after a sitting", () => {
    expect(nextMockIn([sitting("n3-2024-12", 0, 1, 1, 1)], "N3", 4 * DAY)).toBe(10);
  });
});

describe("wordPace", () => {
  it("spreads the words left over the days left", () => {
    expect(wordPace("N5", 567, "2026-12-06", "2026-11-26")).toEqual({ total: 667, left: 100, days: 10, perDay: 10 });
  });

  it("has no pace without an exam date", () => {
    expect(wordPace("N5", 0, null, "2026-11-26").perDay).toBeNull();
  });
});

describe("drillForSection", () => {
  it("maps mock sections to drills", () => {
    expect(drillForSection("language")).toBe("grammar");
    expect(drillForSection("listening")).toBe("listening");
    expect(drillForSection(null)).toBeNull();
  });
});
