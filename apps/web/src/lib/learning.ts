import type { Grade } from "@kotobamichi/srs";
import type { JLPTLevel } from "@/data/grammar";

export const WORD_TOTALS: Record<JLPTLevel, number> = {
  N5: 667,
  N4: 634,
  N3: 1835,
  N2: 1835,
  N1: 3476,
};

export const JLPT_LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export type LearningGrade = Grade;

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

export type LearningGoal = {
  targetLevel: JLPTLevel | null;
  examDate: string | null;
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderHour: number;
  weeklyRecap: boolean;
};

export const DEFAULT_GOAL: LearningGoal = {
  targetLevel: null,
  examDate: null,
  dailyGoal: 20,
  remindersEnabled: false,
  reminderHour: 19,
  weeklyRecap: false,
};

export type LearningSummary = {
  streak: number;
  /** Missing on responses from an API that predates streak freezes. */
  freezes?: number;
  freezesNeeded?: number;
  studiedToday: number;
  dueNow: number;
  mistakesDue?: number;
  mistakesTotal?: number;
  goal?: LearningGoal;
  place: LearningPlace | null;
  bookmarks: Partial<Record<JLPTLevel, LearningBookmark>>;
  levels: { level: JLPTLevel; seen: number; learned: number; due: number }[];
};

export function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
