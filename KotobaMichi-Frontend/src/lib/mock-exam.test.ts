import { describe, expect, it } from "vitest";
import {
  answerKey,
  PASS_SECTION,
  PASS_TOTAL,
  pointsForSection,
  questionCount,
  responseBand,
  SECTION_POINTS,
  scoreByMondai,
  scoreExam,
  toScoringShape,
  type ScorableExam,
} from "@/lib/mock-exam";
import { MOCK_EXAMS, mockExamSummaries } from "@/lib/mock-exam-data";

/** Two sections. Section A has one part with two 問題; section B has two parts. */
const exam: ScorableExam = {
  sections: [
    {
      id: "A",
      title: "Vocabulary",
      parts: [
        {
          id: "p1",
          title: "文字・語彙",
          mondai: [
            { number: 1, items: [{ number: 1, answer: 1 }, { number: 2, answer: 2 }] },
            { number: 2, items: [{ number: 3, answer: 3 }, { number: 4, answer: 4 }] },
          ],
        },
      ],
    },
    {
      id: "B",
      title: "Listening",
      parts: [
        { id: "p2", title: "聴解 1", mondai: [{ number: 1, items: [{ number: 1, answer: 1 }] }] },
        { id: "p3", title: "聴解 2", mondai: [{ number: 1, items: [{ number: 1, answer: 2 }, { number: 2 }] }] },
      ],
    },
  ],
};

const all = (pairs: [string, string, number, number, number][]) =>
  Object.fromEntries(pairs.map(([s, p, m, i, choice]) => [answerKey(s, p, m, i), choice]));

describe("scoreExam", () => {
  it("counts correct answers per section", () => {
    const answers = all([
      ["A", "p1", 1, 1, 1],
      ["A", "p1", 1, 2, 3],
      ["A", "p1", 2, 3, 3],
      ["B", "p2", 1, 1, 1],
    ]);
    expect(scoreExam(exam, answers)).toEqual([
      { id: "A", title: "Vocabulary", correct: 2, total: 4 },
      { id: "B", title: "Listening", correct: 1, total: 3 },
    ]);
  });

  it("never credits an item without an answer key", () => {
    const answers = all([["B", "p3", 1, 2, 1]]);
    expect(scoreExam(exam, answers)[1]?.correct).toBe(0);
  });
});

describe("scoreByMondai", () => {
  it("splits each section's 60 points evenly across parts, then across 問題", () => {
    const rows = scoreByMondai(exam, {});
    const a = rows.filter((row) => row.sectionId === "A");
    const b = rows.filter((row) => row.sectionId === "B");
    expect(a.map((row) => row.share)).toEqual([SECTION_POINTS / 2, SECTION_POINTS / 2]);
    expect(b.map((row) => row.share)).toEqual([SECTION_POINTS / 2, SECTION_POINTS / 2]);
  });

  it("awards the full section for a perfect paper", () => {
    const answers = all([
      ["A", "p1", 1, 1, 1],
      ["A", "p1", 1, 2, 2],
      ["A", "p1", 2, 3, 3],
      ["A", "p1", 2, 4, 4],
    ]);
    expect(pointsForSection(scoreByMondai(exam, answers), "A")).toBeCloseTo(SECTION_POINTS);
  });

  it("gives partial credit inside a 問題", () => {
    const answers = all([["A", "p1", 1, 1, 1]]);
    expect(pointsForSection(scoreByMondai(exam, answers), "A")).toBeCloseTo(15);
  });
});

describe("responseBand", () => {
  it("uses the score report bands", () => {
    expect(responseBand(0, 0)).toBe("C");
    expect(responseBand(2, 3)).toBe("B");
    expect(responseBand(67, 100)).toBe("A");
    expect(responseBand(34, 100)).toBe("B");
    expect(responseBand(33, 100)).toBe("C");
  });

  it("keeps the N3 pass marks", () => {
    expect(PASS_SECTION).toBe(19);
    expect(PASS_TOTAL).toBe(95);
  });
});

describe("catalog summaries", () => {
  it("score past attempts exactly like the full exam does", () => {
    for (const full of MOCK_EXAMS) {
      const answers: Record<string, number> = {};
      for (const section of full.sections) {
        for (const part of section.parts) {
          for (const mondai of part.mondai) {
            for (const item of mondai.items) {
              answers[answerKey(section.id, part.id, mondai.number, item.number)] = (item.number % 4) + 1;
            }
          }
        }
      }
      const slim = toScoringShape(full);
      expect(scoreExam(slim, answers)).toEqual(scoreExam(full, answers));
      expect(scoreByMondai(slim, answers)).toEqual(scoreByMondai(full, answers));
      expect(questionCount(slim)).toBe(questionCount(full));
    }
  });

  it("leave out question text", () => {
    const [first] = mockExamSummaries();
    const json = JSON.stringify(first?.scoring);
    expect(json).not.toContain("prompt");
    expect(json).not.toContain("options");
    expect(json).not.toContain("passage");
  });
});
