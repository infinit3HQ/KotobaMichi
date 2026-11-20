import { describe, expect, it } from "vitest";
import { answerKey, PASS_SECTION, PASS_TOTAL, type ScorableExam } from "@/lib/mock-exam";
import {
  AT_MENU,
  canOpenSection,
  completeSection,
  completedFromSave,
  isSittingComplete,
  nextSuggestedSection,
  summarizeSitting,
} from "@/lib/mock-sitting";

/** Three one-問題 sections, two items each, like the real paper's three blocks. */
const exam: ScorableExam = {
  sections: ["vocabulary", "grammar-reading", "listening"].map((id) => ({
    id,
    title: id,
    parts: [
      {
        id: `${id}-part`,
        title: `${id}-part`,
        mondai: [{ number: 1, items: [{ number: 1, answer: 1 }, { number: 2, answer: 2 }] }],
      },
    ],
  })),
};

const allRight = (sectionIds: string[]) =>
  Object.fromEntries(
    sectionIds.flatMap((id) => [
      [answerKey(id, `${id}-part`, 1, 1), 1],
      [answerKey(id, `${id}-part`, 1, 2), 2],
    ])
  );

describe("canOpenSection", () => {
  it("opens any section that is not done, in any order", () => {
    expect(canOpenSection(exam, [], 2)).toBe(true);
    expect(canOpenSection(exam, ["listening"], 0)).toBe(true);
  });

  it("keeps a closed section closed", () => {
    expect(canOpenSection(exam, ["listening"], 2)).toBe(false);
  });

  it("rejects indexes outside the paper", () => {
    expect(canOpenSection(exam, [], -1)).toBe(false);
    expect(canOpenSection(exam, [], 3)).toBe(false);
  });
});

describe("nextSuggestedSection", () => {
  it("suggests the first section not done, in paper order", () => {
    expect(nextSuggestedSection(exam, [])).toBe(0);
    expect(nextSuggestedSection(exam, ["vocabulary"])).toBe(1);
    expect(nextSuggestedSection(exam, ["grammar-reading"])).toBe(0);
  });

  it("suggests nothing once every section is done", () => {
    expect(nextSuggestedSection(exam, ["vocabulary", "grammar-reading", "listening"])).toBeNull();
  });
});

describe("completeSection", () => {
  it("adds the section once and keeps paper order without changing the input", () => {
    const before = ["listening"];
    const after = completeSection(exam, before, "vocabulary");
    expect(after).toEqual(["vocabulary", "listening"]);
    expect(before).toEqual(["listening"]);
    expect(completeSection(exam, after, "vocabulary")).toEqual(["vocabulary", "listening"]);
  });

  it("ignores ids that are not in the paper", () => {
    expect(completeSection(exam, [], "kanji")).toEqual([]);
  });
});

describe("isSittingComplete", () => {
  it("is complete only when all three sections are done", () => {
    expect(isSittingComplete(exam, ["vocabulary", "listening"])).toBe(false);
    expect(isSittingComplete(exam, ["listening", "vocabulary", "grammar-reading"])).toBe(true);
  });
});

describe("completedFromSave", () => {
  it("uses the saved list when there is one, dropping unknown ids", () => {
    expect(completedFromSave(exam, { sectionIndex: AT_MENU, completedSections: ["listening", "kanji"] })).toEqual([
      "listening",
    ]);
  });

  it("reads an older in-order save as every section before its index being done", () => {
    expect(completedFromSave(exam, { sectionIndex: 2 })).toEqual(["vocabulary", "grammar-reading"]);
    expect(completedFromSave(exam, { sectionIndex: 0 })).toEqual([]);
  });

  it("reads an older finished save as every section done", () => {
    expect(completedFromSave(exam, { sectionIndex: 2, finished: true })).toEqual([
      "vocabulary",
      "grammar-reading",
      "listening",
    ]);
  });
});

describe("summarizeSitting", () => {
  it("gives a total and a pass verdict when all three sections were taken", () => {
    const completed = ["vocabulary", "grammar-reading", "listening"];
    const summary = summarizeSitting(exam, allRight(completed), completed);
    expect(summary.complete).toBe(true);
    expect(summary.total).toBe(180);
    expect(summary.passes).toBe(true);
    expect(summary.sections.map((section) => section.taken)).toEqual([true, true, true]);
  });

  it("scores only the sections taken and gives no total or verdict for a partial sitting", () => {
    const summary = summarizeSitting(exam, allRight(["listening"]), ["listening"]);
    expect(summary.complete).toBe(false);
    expect(summary.total).toBeNull();
    expect(summary.passes).toBeNull();
    const listening = summary.sections.find((section) => section.id === "listening");
    expect(listening).toMatchObject({ taken: true, points: 60, correct: 2, total: 2 });
    const vocabulary = summary.sections.find((section) => section.id === "vocabulary");
    expect(vocabulary).toMatchObject({ taken: false, points: null });
  });

  it("fails the verdict when one group is under the section line", () => {
    const completed = ["vocabulary", "grammar-reading", "listening"];
    const answers = allRight(["vocabulary", "grammar-reading"]);
    const summary = summarizeSitting(exam, answers, completed);
    expect(summary.total).toBe(120);
    expect(summary.total ?? 0).toBeGreaterThanOrEqual(PASS_TOTAL);
    expect(PASS_SECTION).toBeGreaterThan(0);
    expect(summary.passes).toBe(false);
  });
});
