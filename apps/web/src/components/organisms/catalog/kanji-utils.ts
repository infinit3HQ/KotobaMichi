import type { KanjiMasterItem } from "@/data/kanji-master";

export function readingsOf(item: KanjiMasterItem) {
  const clean = (values?: string[]) => (values ?? []).map((value) => value.trim()).filter(Boolean);
  return { on: clean(item.onYomi), kun: clean(item.kunYomi), dominant: item.dominantReading?.trim() ?? "" };
}

export function primaryReading(item: KanjiMasterItem) {
  const { on, kun, dominant } = readingsOf(item);
  return dominant || [...on, ...kun].join("・");
}

/** Matches the character, meaning, level, readings, radicals or example words. */
export function kanjiMatches(item: KanjiMasterItem, query: string) {
  const { on, kun, dominant } = readingsOf(item);
  const text = (value: string) => value.toLowerCase().includes(query);
  return (
    item.character.includes(query) ||
    text(item.meaning) ||
    text(item.level) ||
    text(dominant) ||
    on.some(text) ||
    kun.some(text) ||
    item.radicals.some((radical) => radical.character.includes(query) || text(radical.meaning)) ||
    item.vocabulary.some((word) => word.word.includes(query) || text(word.reading) || text(word.meaning))
  );
}
