import { ALL_LEVELS, ALL_YEARS, type MockCatalogFilters } from "@/lib/mock-catalog";

/** Sentinel for the unfiltered status control. */
export const ALL_STATUSES = "all";

/** Where the signed-in student stands with a paper. */
export type ExamProgress = "new" | "open" | "done";

export const PROGRESS_VALUES: readonly ExamProgress[] = ["new", "open", "done"];

export type CatalogStatus = ExamProgress | typeof ALL_STATUSES;

export type CatalogFilters = MockCatalogFilters & { status: CatalogStatus };

/** The fields of a saved attempt the catalog needs. */
export type AttemptLike = { examId: string; status: string; mode?: string };

export type ExamAttempts<T extends AttemptLike> = {
  open: T | null;
  /** Finished sittings, in the order the API returned them (newest first). */
  finished: T[];
};

/** One pass over the attempts, so each card does not rescan the whole list. */
export function attemptsByExam<T extends AttemptLike>(attempts: readonly T[]) {
  const map = new Map<string, ExamAttempts<T>>();
  for (const attempt of attempts) {
    const entry = map.get(attempt.examId) ?? { open: null, finished: [] };
    if (attempt.status === "in_progress") {
      map.set(attempt.examId, { ...entry, open: entry.open ?? attempt });
    } else if (attempt.status === "finished") {
      map.set(attempt.examId, { ...entry, finished: [...entry.finished, attempt] });
    }
  }
  return map;
}

export function examProgress<T extends AttemptLike>(
  map: ReadonlyMap<string, ExamAttempts<T>>,
  examId: string,
): ExamProgress {
  const entry = map.get(examId);
  if (entry?.open) return "open";
  if (entry && entry.finished.length > 0) return "done";
  return "new";
}

export function filterByStatus<E extends { id: string }, T extends AttemptLike>(
  exams: readonly E[],
  status: CatalogStatus,
  map: ReadonlyMap<string, ExamAttempts<T>>,
): E[] {
  if (status === ALL_STATUSES) return [...exams];
  return exams.filter((exam) => examProgress(map, exam.id) === status);
}

const MONTHS: Record<string, string> = { "07": "July", "12": "December" };

/** "July" or "December" from an id like `n1-2024-07`. */
export function sittingMonth(examId: string) {
  return MONTHS[examId.split("-")[2] ?? ""] ?? "";
}

const LEVEL_RANK: Record<string, number> = { N1: 1, N2: 2, N3: 3, N4: 4, N5: 5 };

/** Papers grouped under their year, newest first; December before July, then by level. */
export function groupByYear<E extends { id: string; year: string; level: string }>(exams: readonly E[]) {
  const sorted = [...exams].sort(
    (a, b) =>
      Number(b.year) - Number(a.year) ||
      b.id.slice(-2).localeCompare(a.id.slice(-2)) ||
      (LEVEL_RANK[a.level] ?? 9) - (LEVEL_RANK[b.level] ?? 9),
  );
  const groups: { year: string; exams: E[] }[] = [];
  for (const exam of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.year === exam.year) {
      groups[groups.length - 1] = { ...last, exams: [...last.exams, exam] };
    } else {
      groups.push({ year: exam.year, exams: [exam] });
    }
  }
  return groups;
}

/** Filters from the URL. Anything that is not a known value falls back to "all". */
export function parseCatalogParams(
  params: Pick<URLSearchParams, "get">,
  known: { levels: readonly string[]; years: readonly string[] },
): CatalogFilters {
  const level = params.get("level") ?? "";
  const year = params.get("year") ?? "";
  const status = params.get("status") ?? "";
  return {
    level: known.levels.includes(level) ? level : ALL_LEVELS,
    year: known.years.includes(year) ? year : ALL_YEARS,
    status: (PROGRESS_VALUES as readonly string[]).includes(status)
      ? (status as ExamProgress)
      : ALL_STATUSES,
  };
}

/** The query string for a set of filters, leaving out the open ones. */
export function catalogQuery(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.level !== ALL_LEVELS) params.set("level", filters.level);
  if (filters.year !== ALL_YEARS) params.set("year", filters.year);
  if (filters.status !== ALL_STATUSES) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}
