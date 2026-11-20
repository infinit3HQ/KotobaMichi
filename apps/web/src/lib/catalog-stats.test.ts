import { describe, expect, it } from "vitest";
import { CATALOG_STATS } from "@/lib/catalog-stats";
import { ALL_JLPT_KANJI_MASTER } from "@/data/kanji-master";
import { ALL_JLPT_GRAMMAR_MASTER } from "@/data/grammar-master";
import { ALL_TANOS_WORDS } from "@/data/vocab-tanos";
import { MOCK_EXAMS } from "@/lib/mock-exam-data";

describe("catalog stats", () => {
  it("match the word list", () => {
    expect(CATALOG_STATS.words).toBe(ALL_TANOS_WORDS.length);
  });

  it("match the kanji list", () => {
    expect(CATALOG_STATS.kanji).toBe(ALL_JLPT_KANJI_MASTER.length);
  });

  it("match the grammar list", () => {
    expect(CATALOG_STATS.grammar).toBe(ALL_JLPT_GRAMMAR_MASTER.length);
  });

  it("match the mock papers", () => {
    expect(CATALOG_STATS.mockPapers).toBe(MOCK_EXAMS.length);
  });
});
