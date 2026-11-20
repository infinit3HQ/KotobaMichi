import type { ComponentType } from "react";
import { BookOpen, Grid3x3, Headphones, Layers, Puzzle, Repeat, Sparkles, Zap } from "lucide-react";
import type { JLPTLevel } from "@/data/grammar";

export const DRILL_IDS = ["sprint", "walk", "grammar", "kanji", "listening", "reading", "flashcard", "kana"] as const;

export type PracticeMode = (typeof DRILL_IDS)[number];

export const DRILL_ICONS: Record<PracticeMode, ComponentType<{ className?: string }>> = {
  sprint: Zap,
  walk: Repeat,
  grammar: Sparkles,
  kanji: Puzzle,
  listening: Headphones,
  reading: BookOpen,
  flashcard: Layers,
  kana: Grid3x3,
};

export const PRACTICE_LEVELS: readonly JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export function isPracticeMode(value: string | null | undefined): value is PracticeMode {
  return value != null && (DRILL_IDS as readonly string[]).includes(value);
}

export function isPracticeLevel(value: string | null | undefined): value is JLPTLevel {
  return value != null && (PRACTICE_LEVELS as readonly string[]).includes(value);
}
