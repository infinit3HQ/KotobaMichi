import type { MockExamSummary } from "@/lib/mock-exam";

/** Sentinel for the unfiltered level and year controls. */
export const ALL_LEVELS = "all";
export const ALL_YEARS = "all";

const LEVEL_ORDER = ["N1", "N2", "N3", "N4", "N5"] as const;

export type MockCatalogFilters = {
  level: string;
  year: string;
};

/** Levels that actually have sittings, in JLPT order. */
export function catalogLevels(exams: readonly Pick<MockExamSummary, "level">[]) {
  const present = new Set(exams.map((exam) => exam.level));
  const known = LEVEL_ORDER.filter((level) => present.has(level));
  const knownSet = new Set<string>(known);
  const extra = [...present].filter((level) => !knownSet.has(level)).sort();
  return [...known, ...extra];
}

/** Years that actually have sittings, newest first. */
export function catalogYears(exams: readonly Pick<MockExamSummary, "year">[]) {
  return [...new Set(exams.map((exam) => exam.year).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a),
  );
}

/** Keep sittings that match the chosen level and year. `all` leaves that axis open. */
export function filterMockExams<T extends Pick<MockExamSummary, "level" | "year">>(
  exams: readonly T[],
  filters: MockCatalogFilters,
): T[] {
  return exams.filter((exam) => {
    if (filters.level !== ALL_LEVELS && exam.level !== filters.level) return false;
    if (filters.year !== ALL_YEARS && exam.year !== filters.year) return false;
    return true;
  });
}
