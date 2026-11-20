"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { ALL_JLPT_KANJI_MASTER } from "@/data/kanji-master";
import type { JLPTLevel } from "@/data/grammar";
import { DrillToolbar } from "@/components/organisms/drills/drill-ui";
import { KanjiAnatomy } from "@/components/organisms/drills/kanji-anatomy";
import { KanjiRadicalPuzzle } from "@/components/organisms/drills/kanji-radical-puzzle";

interface KanjiDojoModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

type KanjiSubMode = "cards" | "puzzle";

export function KanjiDojoMode({ selectedLevel, soundEnabled, speechRate }: KanjiDojoModeProps) {
  const [subMode, setSubMode] = useState<KanjiSubMode>("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKanjiId, setSelectedKanjiId] = useState<string | null>(null);

  const kanjiPool = useMemo(
    () => ALL_JLPT_KANJI_MASTER.filter((k) => k.level === selectedLevel),
    [selectedLevel]
  );

  const filteredKanji = useMemo(() => {
    if (!searchQuery.trim()) return kanjiPool;
    const q = searchQuery.toLowerCase().trim();
    return kanjiPool.filter(
      (k) =>
        k.character.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.dominantReading?.toLowerCase().includes(q) ||
        k.radicals.some((r) => r.character.includes(q) || r.meaning.toLowerCase().includes(q)) ||
        k.vocabulary.some(
          (v) => v.word.includes(q) || v.reading.includes(q) || v.meaning.toLowerCase().includes(q)
        )
    );
  }, [kanjiPool, searchQuery]);

  // Kanji shown in the detail panel (defaults to the first match)
  const activeKanji = useMemo(() => {
    if (selectedKanjiId) {
      const found = kanjiPool.find((k) => k.id === selectedKanjiId);
      if (found) return found;
    }
    return filteredKanji[0] || kanjiPool[0] || null;
  }, [selectedKanjiId, kanjiPool, filteredKanji]);

  return (
    <div className="space-y-4">
      <DrillToolbar
        control={
          <SegmentedControl<KanjiSubMode>
            value={subMode}
            onValueChange={setSubMode}
            ariaLabel="Kanji practice type"
            fullWidth
            className="sm:w-fit"
            options={[
              { value: "cards", label: "Browse" },
              { value: "puzzle", label: "Parts puzzle" },
            ]}
          />
        }
        meta={`${selectedLevel} · ${kanjiPool.length} kanji`}
      />

      {subMode === "cards" ? (
        <KanjiAnatomy
          pool={kanjiPool}
          filtered={filteredKanji}
          activeKanji={activeKanji}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectKanji={setSelectedKanjiId}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
          selectedLevel={selectedLevel}
        />
      ) : (
        <KanjiRadicalPuzzle
          key={selectedLevel}
          pool={kanjiPool}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
          selectedLevel={selectedLevel}
        />
      )}
    </div>
  );
}
