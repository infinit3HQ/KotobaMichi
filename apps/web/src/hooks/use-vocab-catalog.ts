"use client";

import { useCallback, useEffect, useState } from "react";
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

export type VocabCatalogState = {
  catalog: VocabCatalog | null;
  failed: boolean;
  retry: () => void;
};

/** Loads the word catalog and reports whether the chunk failed, so pages can offer a retry. */
export function useVocabCatalogState(): VocabCatalogState {
  const [catalog, setCatalog] = useState<VocabCatalog | null>(cached);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (catalog) return;
    let cancelled = false;
    loadVocabCatalog()
      .then((loaded) => {
        if (!cancelled) setCatalog(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [catalog, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((value) => value + 1);
  }, []);

  return { catalog, failed, retry };
}

/** Returns the full word catalog once its chunk has loaded, and null before that. */
export function useVocabCatalog() {
  return useVocabCatalogState().catalog;
}
