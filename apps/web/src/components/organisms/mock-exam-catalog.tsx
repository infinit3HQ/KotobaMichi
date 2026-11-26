"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, Timer } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { EmptyState } from "@/components/molecules/empty-state";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { CatalogRow, ContinueStrip } from "@/components/organisms/mock/catalog-row";
import type { MockExamSummary } from "@/lib/mock-exam";
import { ALL_LEVELS, ALL_YEARS, catalogLevels, catalogYears, filterMockExams } from "@/lib/mock-catalog";
import {
  ALL_STATUSES,
  attemptsByExam,
  catalogQuery,
  examProgress,
  filterByStatus,
  groupByYear,
  parseCatalogParams,
  type CatalogFilters,
  type CatalogStatus,
} from "@/lib/mock-catalog-view";
import { listMockAttempts, type RemoteMockAttempt } from "@/lib/mock-attempts";
import { useAuthStore } from "@/stores/auth";

const STATUS_LABELS: Record<CatalogStatus, string> = {
  all: "Any status",
  new: "Not taken",
  open: "In progress",
  done: "Done",
};

function useMyAttempts() {
  const user = useAuthStore((state) => state.user);
  const [attempts, setAttempts] = useState<RemoteMockAttempt[]>([]);

  useEffect(() => {
    if (!user) {
      setAttempts([]);
      return;
    }
    let cancel = false;
    listMockAttempts()
      .then((rows) => {
        if (!cancel) setAttempts(rows);
      })
      .catch(() => {
        if (!cancel) setAttempts([]);
      });
    return () => {
      cancel = true;
    };
  }, [user]);

  return { signedIn: Boolean(user), attempts };
}

/** Filters live in the URL, so back, refresh and shared links keep them. */
function useCatalogFilters(levels: readonly string[], years: readonly string[]) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = parseCatalogParams(params, { levels, years });
  const setFilters = useCallback(
    (next: CatalogFilters) => router.replace(`${pathname}${catalogQuery(next)}`, { scroll: false }),
    [router, pathname],
  );
  return [filters, setFilters] as const;
}

function sittingCount(shown: number, total: number) {
  const noun = total === 1 ? "sitting" : "sittings";
  return `${shown} of ${total} ${noun}`;
}

function SittingFilters({
  filters,
  levels,
  years,
  showStatus,
  onChange,
}: {
  filters: CatalogFilters;
  levels: readonly string[];
  years: readonly string[];
  showStatus: boolean;
  onChange: (next: CatalogFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full overflow-x-auto [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden">
        <SegmentedControl
          value={filters.level}
          onValueChange={(level) => onChange({ ...filters, level })}
          options={[{ value: ALL_LEVELS, label: "All levels" }, ...levels.map((value) => ({ value, label: value }))]}
          ariaLabel="Level"
          fullWidth
          className="sm:w-max"
        />
      </div>
      <Select value={filters.year} onValueChange={(year) => onChange({ ...filters, year })}>
        <SelectTrigger aria-label="Year" className="flex-1 sm:w-36 sm:flex-none">
          <SelectValue>{filters.year === ALL_YEARS ? "All years" : filters.year}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={ALL_YEARS}>All years</SelectItem>
          {years.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showStatus ? (
        <Select
          value={filters.status}
          onValueChange={(status) => onChange({ ...filters, status: status as CatalogStatus })}
        >
          <SelectTrigger aria-label="Status" className="flex-1 sm:w-40 sm:flex-none">
            <SelectValue>{STATUS_LABELS[filters.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as CatalogStatus[]).map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

export function MockExamCatalog({ exams }: { exams: MockExamSummary[] }) {
  const { signedIn, attempts } = useMyAttempts();
  const levels = useMemo(() => catalogLevels(exams), [exams]);
  const years = useMemo(() => catalogYears(exams), [exams]);
  const [filters, setFilters] = useCatalogFilters(levels, years);
  const byExam = useMemo(() => attemptsByExam(attempts), [attempts]);
  // Signed-out visitors have no statuses, so a status from a shared link is ignored.
  const status = signedIn ? filters.status : ALL_STATUSES;
  const groups = useMemo(() => {
    const shown = filterByStatus(filterMockExams(exams, filters), status, byExam);
    return groupByYear(shown);
  }, [exams, filters, status, byExam]);
  const openExams = useMemo(
    () => exams.filter((exam) => examProgress(byExam, exam.id) === "open"),
    [exams, byExam],
  );

  if (exams.length === 0) {
    return (
      <EmptyState icon={Timer} title="No mock papers yet" description="Mock papers will show up here once added." />
    );
  }

  const shownCount = groups.reduce((sum, group) => sum + group.exams.length, 0);
  const clearFilters = () => setFilters({ level: ALL_LEVELS, year: ALL_YEARS, status: ALL_STATUSES });

  return (
    <div className="space-y-6">
      <ContinueStrip exams={openExams} />
      <div className="space-y-3">
        <SittingFilters
          filters={{ ...filters, status }}
          levels={levels}
          years={years}
          showStatus={signedIn}
          onChange={setFilters}
        />
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {sittingCount(shownCount, exams.length)}
        </p>
      </div>
      {shownCount === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No sittings match"
          description="Try another level, year or status."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.year} className="space-y-2" aria-labelledby={`mock-year-${group.year}`}>
              <h2
                id={`mock-year-${group.year}`}
                className="flex items-baseline justify-between text-sm font-semibold tracking-tight"
              >
                {group.year}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {group.exams.length} {group.exams.length === 1 ? "paper" : "papers"}
                </span>
              </h2>
              <Card className="gap-0 overflow-hidden py-0">
                <ul className="divide-y divide-border">
                  {group.exams.map((exam) => (
                    <li key={exam.id}>
                      <CatalogRow exam={exam} entry={byExam.get(exam.id)} />
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
