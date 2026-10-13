import type { JLPTLevel } from "@/data/grammar";

export const WORD_TOTALS: Record<JLPTLevel, number> = {
  N5: 667,
  N4: 634,
  N3: 1835,
  N2: 1835,
  N1: 3476,
};

export const JLPT_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export type LearningGrade = "again" | "hard" | "good" | "easy";

export type LearningPlace = {
  level: JLPTLevel;
  mode: string;
  itemKey: string | null;
  cursor: number;
};

export type LearningBookmark = {
  mode: string;
  itemKey: string | null;
  cursor: number;
};

export type LearningSummary = {
  streak: number;
  studiedToday: number;
  dueNow: number;
  place: LearningPlace | null;
  bookmarks: Partial<Record<JLPTLevel, LearningBookmark>>;
  levels: { level: JLPTLevel; seen: number; learned: number; due: number }[];
};

export function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
