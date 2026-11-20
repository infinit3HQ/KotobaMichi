"use client";

import { useEffect, useMemo, useState } from "react";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { JLPT_PARTICLE_QUESTIONS, JLPT_STAR_QUESTIONS, type JLPTLevel } from "@/data/grammar";
import { ALL_JLPT_GRAMMAR_MASTER } from "@/data/grammar-master";
import { DrillToolbar } from "@/components/organisms/drills/drill-ui";
import { GrammarStarPuzzle } from "@/components/organisms/drills/grammar-star-puzzle";
import { GrammarParticleDrill } from "@/components/organisms/drills/grammar-particle-drill";
import { GrammarHandbook } from "@/components/organisms/drills/grammar-handbook";

interface GrammarLabModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

type GrammarSubMode = "star" | "particle" | "handbook";

export function GrammarLabMode({ selectedLevel, soundEnabled, speechRate }: GrammarLabModeProps) {
  const [subMode, setSubMode] = useState<GrammarSubMode>("star");

  const starPool = useMemo(
    () => JLPT_STAR_QUESTIONS.filter((q) => q.level === selectedLevel),
    [selectedLevel]
  );
  const particlePool = useMemo(
    () => JLPT_PARTICLE_QUESTIONS.filter((q) => q.level === selectedLevel),
    [selectedLevel]
  );
  const handbookPool = useMemo(
    () => ALL_JLPT_GRAMMAR_MASTER.filter((item) => item.level === selectedLevel),
    [selectedLevel]
  );

  useEffect(() => {
    if (starPool.length === 0 && particlePool.length === 0 && handbookPool.length > 0) {
      setSubMode("handbook");
    }
  }, [starPool.length, particlePool.length, handbookPool.length]);

  const meta = {
    star: `${selectedLevel} · ${starPool.length} puzzles`,
    particle: `${selectedLevel} · ${particlePool.length} questions`,
    handbook: `${selectedLevel} · ${handbookPool.length} grammar points`,
  }[subMode];

  const shared = { selectedLevel, soundEnabled, speechRate };

  return (
    <div className="space-y-4">
      <DrillToolbar
        control={
          <SegmentedControl<GrammarSubMode>
            value={subMode}
            onValueChange={setSubMode}
            ariaLabel="Grammar practice type"
            fullWidth
            className="sm:w-fit"
            options={[
              { value: "star", label: "Word order" },
              { value: "particle", label: "Particles" },
              { value: "handbook", label: "Reference" },
            ]}
          />
        }
        meta={meta}
      />

      {subMode === "star" ? (
        <GrammarStarPuzzle key={selectedLevel} pool={starPool} {...shared} />
      ) : subMode === "particle" ? (
        <GrammarParticleDrill key={selectedLevel} pool={particlePool} {...shared} />
      ) : (
        <GrammarHandbook pool={handbookPool} {...shared} />
      )}
    </div>
  );
}
