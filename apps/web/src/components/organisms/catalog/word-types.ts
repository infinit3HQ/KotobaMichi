import type { JLPTWord } from "@/data/vocab-n5";

/** A catalog word with topic and part-of-speech filled in from the labelled N5 set. */
export type CatalogWord = Readonly<JLPTWord>;

export const ALL_TOPICS = "All";
export const GENERAL_TOPIC = "General";

export const wordText = (word: CatalogWord) => word.kanji || word.hiragana;
export const hasDistinctKanji = (word: CatalogWord) => Boolean(word.kanji && word.kanji !== word.hiragana);
