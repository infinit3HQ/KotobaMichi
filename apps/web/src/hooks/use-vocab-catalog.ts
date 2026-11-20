"use client";

import { useEffect, useState } from "react";
import type { JLPTLevel } from "@/data/grammar";
import type { JLPTWord } from "@/data/vocab-n5";

export type VocabCatalog = {
  all: JLPTWord[];
  byLevel: (level: JLPTLevel) => JLPTWord[];
  /** The N5 set with topic and part-of-speech labels. */
  n5: JLPTWord[];
};

let cached: VocabCatalog | null = null;
let pending: Promise<VocabCatalog> | null = null;

function loadVocabCatalog(): Promise<VocabCatalog> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = Promise.all([import("@/data/vocab-tanos"), import("@/data/vocab-n5")])
      .then(([tanos, n5]) => {
        cached = { all: tanos.ALL_TANOS_WORDS, byLevel: tanos.getTanosWordsByLevel, n5: n5.JLPT_N5_WORDS };
        return cached;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

/** Returns the full word catalog once its chunk has loaded, and null before that. */
export function useVocabCatalog() {
  const [catalog, setCatalog] = useState<VocabCatalog | null>(cached);
  useEffect(() => {
    if (catalog) return;
    let cancelled = false;
    loadVocabCatalog()
      .then((loaded) => {
        if (!cancelled) setCatalog(loaded);
      })
      .catch(() => {
        // Leave the loading state up; a reload retries the import.
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);
  return catalog;
}
