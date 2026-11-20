"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { JLPT_READING_PASSAGES } from "@/data/reading";
import { EXAMPLE_SENTENCES } from "@/data/sentences";
import type { JLPTLevel } from "@/data/grammar";
import { DrillToolbar } from "@/components/organisms/drills/drill-ui";
import { ReadingPassageDrill } from "@/components/organisms/drills/reading-passage";
import { ReadingShadowing } from "@/components/organisms/drills/reading-shadowing";

interface ReadingSanctuaryModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

type ReadingView = "passages" | "shadowing";

export function ReadingSanctuaryMode({ selectedLevel, soundEnabled, speechRate }: ReadingSanctuaryModeProps) {
  const [viewTab, setViewTab] = useState<ReadingView>("passages");

  const passageCount = useMemo(
    () => JLPT_READING_PASSAGES.filter((p) => p.level === selectedLevel).length,
    [selectedLevel]
  );

  const meta =
    viewTab === "passages"
      ? `${selectedLevel} · ${passageCount} passages`
      : `${EXAMPLE_SENTENCES.length.toLocaleString()} sentences`;

  return (
    <div className="space-y-4">
      <DrillToolbar
        control={
          <SegmentedControl<ReadingView>
            value={viewTab}
            onValueChange={setViewTab}
            ariaLabel="Reading practice type"
            fullWidth
            className="sm:w-fit"
            options={[
              { value: "passages", label: "Passages" },
              { value: "shadowing", label: "Sentences" },
            ]}
          />
        }
        meta={meta}
      />

      {/* Both views stay mounted so switching back keeps your place. */}
      <div hidden={viewTab !== "passages"}>
        <ReadingPassageDrill
          key={selectedLevel}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      </div>
      <div hidden={viewTab !== "shadowing"}>
        <ReadingShadowing speechRate={speechRate} />
      </div>
    </div>
  );
}
