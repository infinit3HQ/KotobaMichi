import type { JLPTLevel } from "./grammar";
import { JLPT_N5_WORDS, type JLPTWord } from "./vocab-n5";
import { getTanosWordsByLevel } from "./vocab-tanos";

let n5WithTopics: JLPTWord[] | null = null;

function n5TopicByHiragana(): Map<string, string> {
  const map = new Map<string, string>();
  for (const word of JLPT_N5_WORDS) {
    if (word.topic) map.set(word.hiragana, word.topic);
  }
  return map;
}

/** Vocabulary for the selected JLPT level. N5 keeps its topic labels; other levels use the Tanos catalog. */
export function wordsForLevel(level: JLPTLevel): JLPTWord[] {
  if (level !== "N5") return getTanosWordsByLevel(level);
  if (!n5WithTopics) {
    const topics = n5TopicByHiragana();
    n5WithTopics = getTanosWordsByLevel("N5").map((word) => ({
      ...word,
      topic: topics.get(word.hiragana) || word.topic || "General",
    }));
  }
  return n5WithTopics;
}

export function topicCountsForLevel(level: JLPTLevel): { topic: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const word of wordsForLevel(level)) {
    if (!word.topic || word.topic === "General") continue;
    counts.set(word.topic, (counts.get(word.topic) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([topic, count]) => ({ topic, count }));
}

export function wordsForTopic(level: JLPTLevel, topic: string): JLPTWord[] {
  const levelWords = wordsForLevel(level);
  if (topic === "All") return levelWords;
  const filtered = levelWords.filter((word) => word.topic === topic);
  return filtered.length > 0 ? filtered : levelWords;
}

export function englishChoices(word: JLPTWord, pool: JLPTWord[], count = 4): string[] {
  const answerKey = word.english.trim().toLowerCase();
  const picked: string[] = [];
  const seen = new Set<string>([answerKey]);
  const order = [...pool];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (const item of order) {
    const text = item.english.trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    picked.push(text);
    if (picked.length >= count - 1) break;
  }
  const options = [...picked, word.english];
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
