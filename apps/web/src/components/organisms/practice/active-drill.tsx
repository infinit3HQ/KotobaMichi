"use client";

import dynamic from "next/dynamic";
import type { JLPTLevel } from "@/data/grammar";
import { DrillSkeleton } from "./drill-skeleton";
import type { PracticeMode } from "./drills";

// Each drill is code-split into its own chunk and loaded on demand.
const loading = () => <DrillSkeleton />;

const SpeedSprintMode = dynamic(
  () => import("@/components/organisms/speed-sprint-mode").then((m) => m.SpeedSprintMode),
  { ssr: false, loading }
);
const WordWalkMode = dynamic(
  () => import("@/components/organisms/word-walk-mode").then((m) => m.WordWalkMode),
  { ssr: false, loading }
);
const GrammarLabMode = dynamic(
  () => import("@/components/organisms/grammar-lab-mode").then((m) => m.GrammarLabMode),
  { ssr: false, loading }
);
const KanjiDojoMode = dynamic(
  () => import("@/components/organisms/kanji-dojo-mode").then((m) => m.KanjiDojoMode),
  { ssr: false, loading }
);
const ListeningComprehensionMode = dynamic(
  () => import("@/components/organisms/listening-comprehension-mode").then((m) => m.ListeningComprehensionMode),
  { ssr: false, loading }
);
const ReadingSanctuaryMode = dynamic(
  () => import("@/components/organisms/reading-sanctuary-mode").then((m) => m.ReadingSanctuaryMode),
  { ssr: false, loading }
);
const FlashcardSrsMode = dynamic(
  () => import("@/components/organisms/flashcard-srs-mode").then((m) => m.FlashcardSrsMode),
  { ssr: false, loading }
);
const KanaMasterMode = dynamic(
  () => import("@/components/organisms/kana-master-mode").then((m) => m.KanaMasterMode),
  { ssr: false, loading }
);

export function ActiveDrill({
  mode,
  level,
  topic,
  onSelectTopic,
  soundEnabled,
  speechRate,
}: {
  mode: PracticeMode;
  level: JLPTLevel;
  topic: string;
  onSelectTopic: (topic: string) => void;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const audio = { soundEnabled, speechRate };

  switch (mode) {
    case "sprint":
      return <SpeedSprintMode selectedLevel={level} selectedTopic={topic} onSelectTopic={onSelectTopic} {...audio} />;
    case "walk":
      return <WordWalkMode selectedLevel={level} selectedTopic={topic} onSelectTopic={onSelectTopic} {...audio} />;
    case "grammar":
      return <GrammarLabMode selectedLevel={level} {...audio} />;
    case "kanji":
      return <KanjiDojoMode selectedLevel={level} {...audio} />;
    case "listening":
      return <ListeningComprehensionMode selectedLevel={level} {...audio} />;
    case "reading":
      return <ReadingSanctuaryMode selectedLevel={level} {...audio} />;
    case "flashcard":
      return <FlashcardSrsMode selectedLevel={level} selectedTopic={topic} {...audio} />;
    case "kana":
      return <KanaMasterMode {...audio} />;
  }
}
