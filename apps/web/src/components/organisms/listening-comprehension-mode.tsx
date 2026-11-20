"use client";

import { useEffect, useMemo, useState } from "react";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { JLPT_LISTENING_SCENARIOS } from "@/data/listening";
import type { JLPTLevel } from "@/data/grammar";
import { wordsForLevel } from "@/data/level-words";
import { DrillToolbar } from "@/components/organisms/drills/drill-ui";
import { ListeningDialogue } from "@/components/organisms/drills/listening-dialogue";
import { ListeningWords } from "@/components/organisms/drills/listening-words";

interface ListeningComprehensionModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

type ListeningSubMode = "dialogue" | "words";

export function ListeningComprehensionMode({
  selectedLevel,
  soundEnabled,
  speechRate,
}: ListeningComprehensionModeProps) {
  const [subMode, setSubMode] = useState<ListeningSubMode>("dialogue");

  const scenarios = useMemo(
    () => JLPT_LISTENING_SCENARIOS.filter((s) => s.level === selectedLevel),
    [selectedLevel]
  );
  const levelWords = useMemo(() => wordsForLevel(selectedLevel), [selectedLevel]);

  useEffect(() => {
    if (scenarios.length === 0) setSubMode("words");
  }, [scenarios.length]);

  const meta =
    subMode === "dialogue"
      ? `${selectedLevel} · ${scenarios.length} conversations`
      : `${selectedLevel} · ${levelWords.length} words`;

  return (
    <div className="space-y-4">
      <DrillToolbar
        control={
          <SegmentedControl<ListeningSubMode>
            value={subMode}
            onValueChange={setSubMode}
            ariaLabel="Listening practice type"
            fullWidth
            className="sm:w-fit"
            options={[
              { value: "dialogue", label: "Conversations" },
              { value: "words", label: "Words" },
            ]}
          />
        }
        meta={meta}
      />

      {subMode === "dialogue" ? (
        <ListeningDialogue
          key={selectedLevel}
          scenarios={scenarios}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      ) : (
        <ListeningWords
          wordPool={levelWords}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      )}
    </div>
  );
}
