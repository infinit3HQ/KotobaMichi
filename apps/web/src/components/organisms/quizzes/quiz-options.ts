import type { QuizWord } from "@/types/api";

const MAX_OPTIONS = 4;

/** Small deterministic hash so a question keeps the same option order across renders. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededOrder<T>(items: readonly T[], seed: string, key: (item: T) => string): T[] {
  return [...items].sort((a, b) => hashString(seed + key(a)) - hashString(seed + key(b)));
}

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Multiple-choice options for one quiz word: its English meaning plus up to three
 * meanings from other words in the same quiz. The API grades the submitted text against
 * the stored meaning, so every option is the stored string exactly as saved (whitespace
 * included); trimming is only used to compare and dedupe. Returns fewer than two options
 * when the quiz has no other distinct meanings, and the caller then falls back to typing.
 */
export function buildQuizOptions(words: readonly QuizWord[], wordId: string): string[] {
  const target = words.find((qw) => qw.wordId === wordId);
  const answer = target?.word.english;
  if (!target || !answer || normalize(answer).length === 0) return [];

  const seen = new Set([normalize(answer)]);
  const distractors = words
    .filter((qw) => qw.wordId !== wordId)
    .map((qw) => qw.word.english ?? "")
    .filter((english) => {
      const key = normalize(english);
      if (key.length === 0 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const picked = seededOrder(distractors, wordId, (english) => english).slice(0, MAX_OPTIONS - 1);
  return seededOrder([answer, ...picked], `${wordId}:order`, (english) => english);
}
