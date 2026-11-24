import { WORD_TOTALS } from "@/lib/learning";

/**
 * Headline counts for the landing page. Kept as plain numbers so the home page does not
 * pull the full word, kanji and grammar lists into its bundle; `catalog-stats.test.ts`
 * fails if they drift from the data.
 */
export const CATALOG_STATS = {
  words: Object.values(WORD_TOTALS).reduce((sum, count) => sum + count, 0),
  kanji: 979,
  grammar: 826,
  mockPapers: 94,
} as const;

export const formatCount = (value: number) => value.toLocaleString("en-US");
