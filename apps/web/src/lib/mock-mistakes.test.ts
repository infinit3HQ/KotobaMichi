import { describe, expect, it } from "vitest";
import type { MockExam } from "./mock-exam";
import { missedReviewable, mistakeCard, parseMistakeKey } from "./mock-mistakes";

const option = (n: number) => ({ number: n, text: `choice ${n}` });

const exam: MockExam = {
  id: "n3-2024-12",
  level: "N3",
  session: "2024-12",
  title: "N3",
  note: "",
  audio: { file: "", note: "" },
  sections: [
    {
      id: "vocabulary",
      title: "文字・語彙",
      minutes: 30,
      parts: [
        {
          id: "vocabulary",
          title: "文字・語彙",
          mondai: [
            {
              number: 1,
              instruction: "読み方",
              kind: "choice",
              items: [
                { number: 1, prompt: "配った", options: [option(1), option(2)], answer: 2 },
                { number: 2, prompt: "拾った", options: [option(1), option(2)], answer: 1 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "listening",
      title: "聴解",
      minutes: 40,
      parts: [
        {
          id: "listening",
          title: "聴解",
          mondai: [{ number: 1, instruction: "", kind: "listening", items: [{ number: 1, prompt: "1番", options: [], answer: 3 }] }],
        },
      ],
    },
  ],
};

describe("missedReviewable", () => {
  it("lists wrong and blank vocabulary questions, never listening", () => {
    expect(
      missedReviewable(exam, { "vocabulary:vocabulary:1:1": 2 }, ["vocabulary", "listening"])
    ).toEqual(["vocabulary:vocabulary:1:2"]);
  });

  it("skips sections that were not taken", () => {
    expect(missedReviewable(exam, {}, ["listening"])).toEqual([]);
  });
});

describe("mistakeCard", () => {
  it("finds the question and its answer", () => {
    expect(mistakeCard(exam, "mock:n3-2024-12:vocabulary:vocabulary:1:2")).toMatchObject({
      prompt: "拾った",
      answer: 1,
      level: "N3",
    });
  });

  it("returns null for a key from another paper", () => {
    expect(mistakeCard(exam, "mock:n3-2010-07:vocabulary:vocabulary:1:2")).toBeNull();
  });
});

describe("parseMistakeKey", () => {
  it("ignores word cards", () => {
    expect(parseMistakeKey("word-123")).toBeNull();
  });
});
