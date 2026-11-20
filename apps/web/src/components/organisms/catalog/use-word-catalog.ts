"use client";

import { useMemo } from "react";
import type { JLPTWord } from "@/data/vocab-n5";
import type { VocabCatalog } from "@/hooks/use-vocab-catalog";
import { JLPT_LEVELS, type CatalogLevel } from "./catalog-types";
import { ALL_TOPICS, GENERAL_TOPIC, type CatalogWord } from "./word-types";

const EMPTY_COUNTS: Record<CatalogLevel, number> = { ALL: 0, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };

function buildMetaMap(vocab: VocabCatalog | null) {
  const map = new Map<string, JLPTWord>();
  vocab?.n5.forEach((word) => {
    map.set(word.id, word);
    if (word.hiragana) map.set(word.hiragana, word);
  });
  return map;
}

function matchesQuery(word: CatalogWord, query: string) {
  return [word.english, word.hiragana, word.romaji, word.kanji ?? "", word.level, word.topic].some((value) =>
    value?.toLowerCase().includes(query)
  );
}

/** Words for a level with topics, topic counts and the search/topic-filtered list. */
export function useWordCatalog(vocab: VocabCatalog | null, level: CatalogLevel, topic: string, search: string) {
  const metaMap = useMemo(() => buildMetaMap(vocab), [vocab]);

  const levelCounts = useMemo(() => {
    if (!vocab) return EMPTY_COUNTS;
    const entries = JLPT_LEVELS.map((value) => [value, vocab.byLevel(value).length] as const);
    return { ...EMPTY_COUNTS, ...Object.fromEntries(entries), ALL: vocab.all.length };
  }, [vocab]);

  const words: CatalogWord[] = useMemo(() => {
    if (!vocab) return [];
    const raw = level === "ALL" ? vocab.all : vocab.byLevel(level);
    return raw.map((word) => {
      const meta = metaMap.get(word.id) ?? metaMap.get(word.hiragana);
      return {
        ...word,
        topic: meta?.topic ?? word.topic ?? GENERAL_TOPIC,
        partOfSpeech: meta?.partOfSpeech ?? word.partOfSpeech ?? "",
      };
    });
  }, [vocab, level, metaMap]);

  const topicCounts = useMemo(() => {
    // Counting into a fresh local Map keeps this linear for the 8,000+ word list.
    const counts = new Map<string, number>();
    words.forEach((word) => counts.set(word.topic, (counts.get(word.topic) ?? 0) + 1));
    return { ...Object.fromEntries(counts), [ALL_TOPICS]: words.length } as Readonly<Record<string, number>>;
  }, [words]);

  const topics = useMemo(() => {
    const named = Object.keys(topicCounts)
      .filter((name) => name !== ALL_TOPICS && name !== GENERAL_TOPIC)
      .sort();
    return [ALL_TOPICS, ...named, ...(topicCounts[GENERAL_TOPIC] ? [GENERAL_TOPIC] : [])];
  }, [topicCounts]);

  const filtered = useMemo(() => {
    const byTopic = topic === ALL_TOPICS ? words : words.filter((word) => word.topic === topic);
    const query = search.trim().toLowerCase();
    return query ? byTopic.filter((word) => matchesQuery(word, query)) : byTopic;
  }, [words, topic, search]);

  return { words, filtered, levelCounts, topics, topicCounts };
}
