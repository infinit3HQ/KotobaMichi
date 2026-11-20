import { describe, expect, it } from "vitest";
import type { QuizWord } from "@/types/api";
import { buildQuizOptions } from "./quiz-options";

function quizWord(id: string, english: string): QuizWord {
  return {
    id: `qw-${id}`,
    wordId: id,
    word: {
      id,
      kanji: null,
      hiragana: `h-${id}`,
      romaji: null,
      english,
      pronunciationUrl: "",
      level: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

const WORDS = ["dog", "cat", "bird", "fish", "horse", "cow"].map((english, i) => quizWord(`w${i}`, english));

describe("buildQuizOptions", () => {
  it("includes the correct meaning and at most four options", () => {
    const options = buildQuizOptions(WORDS, "w0");
    expect(options).toContain("dog");
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
  });

  it("is stable for the same question", () => {
    expect(buildQuizOptions(WORDS, "w2")).toEqual(buildQuizOptions(WORDS, "w2"));
  });

  it("drops duplicate meanings and the answer itself from distractors", () => {
    const words = [quizWord("a", "Dog"), quizWord("b", "dog"), quizWord("c", "cat"), quizWord("d", "cat")];
    const options = buildQuizOptions(words, "a");
    expect(options.sort()).toEqual(["Dog", "cat"]);
  });

  it("returns a single option when the quiz has one word", () => {
    expect(buildQuizOptions([quizWord("a", "dog")], "a")).toEqual(["dog"]);
  });

  it("submits the stored meaning exactly, whitespace included", () => {
    const words = [quizWord("a", " dog "), quizWord("b", "cat"), quizWord("c", "cat ")];
    const options = buildQuizOptions(words, "a");
    expect(options).toContain(" dog ");
    expect(options).toHaveLength(2);
  });

  it("returns nothing for an unknown word", () => {
    expect(buildQuizOptions(WORDS, "missing")).toEqual([]);
  });
});
