import type { JLPTLevel } from "@/data/grammar";
import { WORD_TOTALS } from "@/lib/learning";

/** What the plan reads from a saved sitting. */
export type PlanAttempt = {
  examId: string;
  status: string;
  finishedAt: number | null;
  scores: { id: string; title: string; correct: number; total: number }[] | null;
};

/** Pass totals out of 180 for the three-section levels the mocks cover. */
export const PASS_TOTALS: Partial<Record<JLPTLevel, number>> = { N1: 100, N2: 90, N3: 95 };
export const SECTION_PASS = 19;
export const SECTION_MAX = 60;
/** Suggest a fresh mock when the last one is this many days old. */
export const MOCK_EVERY_DAYS = 14;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function toDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromDay(day: string) {
  return new Date(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)));
}

export function daysUntil(day: string, today: string) {
  return Math.round((fromDay(day).getTime() - fromDay(today).getTime()) / 86_400_000);
}

function firstSunday(year: number, monthIndex: number) {
  const date = new Date(year, monthIndex, 1);
  date.setDate(1 + ((7 - date.getDay()) % 7));
  return toDay(date);
}

/** The next JLPT sittings on or after `today`: the first Sunday of July and of December. */
export function upcomingSittings(today: string, count = 2) {
  const year = Number(today.slice(0, 4));
  const dates: string[] = [];
  for (let y = year; dates.length < count && y < year + 3; y += 1) {
    for (const month of [6, 11]) {
      const date = firstSunday(y, month);
      if (date >= today && dates.length < count) dates.push(date);
    }
  }
  return dates;
}

export function formatSitting(day: string) {
  return `${MONTHS[Number(day.slice(5, 7)) - 1]} ${Number(day.slice(8, 10))}, ${day.slice(0, 4)}`;
}

/** `n3-2024-12` → `N3`. */
export function levelOfExam(examId: string): JLPTLevel | null {
  const level = examId.slice(0, 2).toUpperCase();
  return /^N[1-5]$/.test(level) ? (level as JLPTLevel) : null;
}

/** `n3-2024-12` → `N3 · December 2024`. */
export function examLabel(examId: string) {
  const match = /^n([1-5])-(\d{4})-(\d{2})$/.exec(examId);
  if (!match) return examId;
  return `N${match[1]} · ${MONTHS[Number(match[3]) - 1]} ${match[2]}`;
}

function finishedFor(attempts: readonly PlanAttempt[], level: JLPTLevel) {
  return attempts
    .filter((a) => a.status === "finished" && a.finishedAt != null && a.scores && levelOfExam(a.examId) === level)
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));
}

function points(score: { correct: number; total: number }) {
  return score.total > 0 ? (score.correct / score.total) * SECTION_MAX : 0;
}

/** Total out of 180 for each finished sitting at this level, oldest first. */
export function scoreTrend(attempts: readonly PlanAttempt[], level: JLPTLevel) {
  return finishedFor(attempts, level).map((attempt) => ({
    examId: attempt.examId,
    finishedAt: attempt.finishedAt ?? 0,
    total: Math.round((attempt.scores ?? []).reduce((sum, s) => sum + points(s), 0)),
  }));
}

/**
 * A pass estimate from the average of the last three sittings at this level.
 * Mocks only cover N1–N3, so other levels return null.
 */
export function predictPass(attempts: readonly PlanAttempt[], level: JLPTLevel) {
  const passTotal = PASS_TOTALS[level];
  const recent = finishedFor(attempts, level).slice(-3);
  if (!passTotal || recent.length === 0) return null;
  const byId = new Map<string, { title: string; sum: number; n: number }>();
  for (const attempt of recent) {
    for (const score of attempt.scores ?? []) {
      if (score.total === 0) continue;
      const row = byId.get(score.id) ?? { title: score.title, sum: 0, n: 0 };
      byId.set(score.id, { title: row.title, sum: row.sum + points(score), n: row.n + 1 });
    }
  }
  const sections = [...byId.entries()].map(([id, row]) => {
    const value = Math.round(row.sum / row.n);
    return { id, title: row.title, points: value, passes: value >= SECTION_PASS };
  });
  const total = sections.reduce((sum, s) => sum + s.points, 0);
  const weakest = [...sections].sort((a, b) => a.points - b.points)[0] ?? null;
  return {
    sections,
    total,
    passTotal,
    passes: sections.length === 3 && total >= passTotal && sections.every((s) => s.passes),
    sittings: recent.length,
    weakest: weakest?.id ?? null,
  };
}

/** Days until the next mock is worth sitting; 0 means now. */
export function nextMockIn(attempts: readonly PlanAttempt[], level: JLPTLevel, now = Date.now()) {
  const last = finishedFor(attempts, level).at(-1);
  if (last?.finishedAt == null) return 0;
  const since = Math.floor((now - last.finishedAt) / 86_400_000);
  return Math.max(0, MOCK_EVERY_DAYS - since);
}

/** New words a day needed to cover the level's list by the exam. */
export function wordPace(level: JLPTLevel, learned: number, examDate: string | null, today: string) {
  const total = WORD_TOTALS[level];
  const left = Math.max(0, total - learned);
  if (!examDate) return { total, left, days: null, perDay: null };
  const days = daysUntil(examDate, today);
  if (days <= 0) return { total, left, days, perDay: null };
  return { total, left, days, perDay: Math.ceil(left / days) };
}

/** The practice drill that trains a mock section. */
export function drillForSection(sectionId: string | null) {
  if (sectionId === "reading") return "reading" as const;
  if (sectionId === "listening") return "listening" as const;
  if (sectionId === "language") return "grammar" as const;
  return null;
}
