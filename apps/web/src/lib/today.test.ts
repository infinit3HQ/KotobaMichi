import { describe, expect, it } from "vitest";
import type { LearningSummary } from "./learning";
import { milestones, newlyEarned, nextMilestone } from "./milestones";
import { dayProgress, nextTask, planLevel, todayTasks } from "./today";

function summary(overrides: Partial<LearningSummary> = {}): LearningSummary {
  return {
    streak: 0,
    studiedToday: 0,
    dueNow: 0,
    place: null,
    bookmarks: {},
    levels: [
      { level: "N5", seen: 0, learned: 0, due: 0 },
      { level: "N4", seen: 0, learned: 0, due: 0 },
      { level: "N3", seen: 0, learned: 0, due: 0 },
      { level: "N2", seen: 0, learned: 0, due: 0 },
      { level: "N1", seen: 0, learned: 0, due: 0 },
    ],
    ...overrides,
  };
}

const goal = {
  targetLevel: "N3" as const,
  examDate: "2027-07-04",
  dailyGoal: 20,
  remindersEnabled: false,
  reminderHour: 19,
  weeklyRecap: false,
};

describe("planLevel", () => {
  it("prefers the exam goal over the last place", () => {
    expect(planLevel(summary({ goal, place: { level: "N5", mode: "kana", itemKey: null, cursor: 0 } }))).toBe("N3");
  });

  it("falls back to N5", () => {
    expect(planLevel(summary())).toBe("N5");
  });
});

describe("todayTasks", () => {
  it("puts due reviews first and skips mistakes when there are none", () => {
    const tasks = todayTasks(summary({ dueNow: 12, goal }), "listening");
    expect(tasks.map((t) => t.id)).toEqual(["reviews", "new", "drill"]);
    expect(tasks[0]).toMatchObject({ count: 12, done: false, href: "/practice?level=N3&mode=flashcard" });
    expect(tasks[2]?.href).toBe("/practice?level=N3&mode=listening");
  });

  it("adds missed mock questions once the learner has some", () => {
    const tasks = todayTasks(summary({ mistakesTotal: 8, mistakesDue: 3 }), null);
    expect(tasks.find((t) => t.id === "mistakes")).toMatchObject({ count: 3, href: "/review" });
  });

  it("counts new words down to the daily goal", () => {
    const tasks = todayTasks(summary({ studiedToday: 15, goal }), null);
    expect(tasks.find((t) => t.id === "new")?.count).toBe(5);
  });

  it("starts at the first unfinished task", () => {
    const tasks = todayTasks(summary({ studiedToday: 20, goal }), null);
    expect(nextTask(tasks)?.id).toBe("drill");
  });
});

describe("dayProgress", () => {
  it("caps at one", () => {
    expect(dayProgress(summary({ studiedToday: 30, goal }))).toBe(1);
    expect(dayProgress(summary({ studiedToday: 5, goal }))).toBe(0.25);
  });
});

describe("milestones", () => {
  it("earns streak and word milestones from the summary", () => {
    const list = milestones(
      summary({ streak: 7, levels: [{ level: "N5", seen: 120, learned: 120, due: 0 }] }),
      []
    );
    const earned = list.filter((m) => m.earned).map((m) => m.id);
    expect(earned).toEqual(["streak-3", "streak-7", "words-50", "words-100"]);
  });

  it("counts a passing mock", () => {
    const list = milestones(summary(), [
      {
        examId: "n3-2024-12",
        status: "finished",
        finishedAt: 1,
        scores: [
          { id: "language", title: "", correct: 40, total: 60 },
          { id: "reading", title: "", correct: 40, total: 60 },
          { id: "listening", title: "", correct: 40, total: 60 },
        ],
      },
    ]);
    expect(list.find((m) => m.id === "mock-pass")?.earned).toBe(true);
    expect(list.find((m) => m.id === "first-mock")?.earned).toBe(true);
  });

  it("picks the closest unearned one next and spots new ones", () => {
    const list = milestones(summary({ streak: 2 }), []);
    expect(nextMilestone(list)?.id).toBe("streak-3");
    const after = milestones(summary({ streak: 3 }), []);
    expect(newlyEarned(after, []).map((m) => m.id)).toEqual(["streak-3"]);
    expect(newlyEarned(after, ["streak-3"])).toEqual([]);
  });
});
