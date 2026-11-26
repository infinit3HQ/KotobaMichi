import type { JLPTLevel } from "@/data/grammar";
import { PASS_TOTALS, SECTION_PASS, levelOfExam, type PlanAttempt } from "@/lib/exam-plan";
import { JLPT_LEVELS, WORD_TOTALS, type LearningSummary } from "@/lib/learning";

export type MilestoneKind = "streak" | "words" | "level" | "firstMock" | "mockPass";

export type Milestone = {
  id: string;
  kind: MilestoneKind;
  /** The number in the title: days, words, or the level. */
  value: number | JLPTLevel | null;
  current: number;
  target: number;
  earned: boolean;
};

const STREAKS = [3, 7, 30, 100];
const WORDS = [50, 100, 250, 500, 1000, 2500];
/** A level counts as done at this share of its word list. */
export const LEVEL_DONE = 0.9;

function sittingPasses(attempt: PlanAttempt) {
  const level = levelOfExam(attempt.examId);
  const passTotal = level ? PASS_TOTALS[level] : undefined;
  const scores = attempt.scores ?? [];
  if (!passTotal || scores.length !== 3) return false;
  const points = scores.map((s) => (s.total > 0 ? (s.correct / s.total) * 60 : 0));
  return points.every((p) => p >= SECTION_PASS) && points.reduce((a, b) => a + b, 0) >= passTotal;
}

/** Every milestone with progress, earned ones included. Worked out from data the app already has. */
export function milestones(summary: LearningSummary, attempts: readonly PlanAttempt[]): Milestone[] {
  const learned = summary.levels.reduce((sum, row) => sum + row.learned, 0);
  const finished = attempts.filter((a) => a.status === "finished");
  const list: Milestone[] = [
    ...STREAKS.map((days) => ({
      id: `streak-${days}`,
      kind: "streak" as const,
      value: days,
      current: Math.min(summary.streak, days),
      target: days,
      earned: summary.streak >= days,
    })),
    ...WORDS.map((count) => ({
      id: `words-${count}`,
      kind: "words" as const,
      value: count,
      current: Math.min(learned, count),
      target: count,
      earned: learned >= count,
    })),
    ...JLPT_LEVELS.map((level) => {
      const row = summary.levels.find((r) => r.level === level);
      const target = Math.ceil(WORD_TOTALS[level] * LEVEL_DONE);
      const current = Math.min(row?.learned ?? 0, target);
      return { id: `level-${level}`, kind: "level" as const, value: level, current, target, earned: current >= target };
    }),
    {
      id: "first-mock",
      kind: "firstMock",
      value: null,
      current: Math.min(finished.length, 1),
      target: 1,
      earned: finished.length > 0,
    },
    {
      id: "mock-pass",
      kind: "mockPass",
      value: null,
      current: finished.some(sittingPasses) ? 1 : 0,
      target: 1,
      earned: finished.some(sittingPasses),
    },
  ];
  return list;
}

/** The unearned milestone closest to done, to show as the next goal. */
export function nextMilestone(list: readonly Milestone[]) {
  return (
    [...list]
      .filter((m) => !m.earned)
      .sort((a, b) => b.current / b.target - a.current / a.target)[0] ?? null
  );
}

/** Milestones earned now that were not in `seen`. */
export function newlyEarned(list: readonly Milestone[], seen: readonly string[]) {
  const known = new Set(seen);
  return list.filter((m) => m.earned && !known.has(m.id));
}
