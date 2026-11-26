import type { JLPTLevel } from "@/data/grammar";
import { DEFAULT_GOAL, type LearningSummary } from "@/lib/learning";

export type TodayTaskId = "reviews" | "new" | "mistakes" | "drill";

export type TodayTask = {
  id: TodayTaskId;
  href: string;
  /** Cards to clear or learn; for the drill, null. */
  count: number | null;
  done: boolean;
};

/** The level the plan works on: the exam goal first, then where they last practised. */
export function planLevel(summary: LearningSummary): JLPTLevel {
  return summary.goal?.targetLevel ?? (summary.place?.level as JLPTLevel | undefined) ?? "N5";
}

/** Share of today's card goal done, 0 to 1. */
export function dayProgress(summary: LearningSummary) {
  const goal = summary.goal?.dailyGoal ?? DEFAULT_GOAL.dailyGoal;
  return goal > 0 ? Math.min(1, summary.studiedToday / goal) : 1;
}

/**
 * About ten minutes of work, most valuable first: due reviews, missed mock
 * questions, new words up to the daily goal, then one drill on the weakest section.
 */
export function todayTasks(summary: LearningSummary, weakDrill: string | null): TodayTask[] {
  const level = planLevel(summary);
  const goal = summary.goal?.dailyGoal ?? DEFAULT_GOAL.dailyGoal;
  const flashcards = `/practice?level=${level}&mode=flashcard`;
  const newLeft = Math.max(0, goal - summary.studiedToday);
  const tasks: TodayTask[] = [
    { id: "reviews", href: flashcards, count: summary.dueNow, done: summary.dueNow === 0 },
  ];
  if ((summary.mistakesTotal ?? 0) > 0) {
    const due = summary.mistakesDue ?? 0;
    tasks.push({ id: "mistakes", href: "/review", count: due, done: due === 0 });
  }
  tasks.push({ id: "new", href: flashcards, count: newLeft, done: newLeft === 0 });
  const mode = weakDrill ?? "grammar";
  tasks.push({ id: "drill", href: `/practice?level=${level}&mode=${mode}`, count: null, done: false });
  return tasks;
}

/** Where the Start button goes: the first task not done yet. */
export function nextTask(tasks: readonly TodayTask[]) {
  return tasks.find((task) => !task.done) ?? null;
}
