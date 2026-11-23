"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, SearchX, Timer } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { EmptyState } from "@/components/molecules/empty-state";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import {
  formatPoints,
  paperPoints,
  SECTION_POINTS,
  type MockExamSummary,
} from "@/lib/mock-exam";
import {
  ALL_LEVELS,
  ALL_YEARS,
  catalogLevels,
  catalogYears,
  filterMockExams,
} from "@/lib/mock-catalog";
import { completedFromSave, summarizeSitting } from "@/lib/mock-sitting";
import { listMockAttempts, type RemoteMockAttempt } from "@/lib/mock-attempts";
import { useAuthStore } from "@/stores/auth";

/** "Last estimate 112.4/180." for a full sitting, or "Last sitting: 聴解 41.2/60." for a partial one. */
function lastSittingLine(exam: MockExamSummary, attempt: RemoteMockAttempt) {
  const completed = completedFromSave(exam.scoring, {
    ...attempt,
    finished: true,
  });
  const summary = summarizeSitting(
    exam.scoring,
    attempt.answers ?? {},
    completed,
  );
  if (summary.total != null)
    return `Last estimate ${formatPoints(summary.total)}/${paperPoints(exam.scoring.sections.length)}.`;
  const taken = summary.sections
    .filter((section) => section.points != null)
    .map(
      (section) =>
        `${section.title} ${formatPoints(section.points ?? 0)}/${SECTION_POINTS}`,
    );
  return `Last sitting: ${taken.join(", ") || "no section"}.`;
}

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

function ExamCard({
  exam,
  attempts,
}: {
  exam: MockExamSummary;
  attempts: readonly RemoteMockAttempt[];
}) {
  const mine = attempts.filter(
    (attempt) => attempt.examId === exam.id && attempt.status === "finished",
  );
  const open = attempts.some(
    (attempt) => attempt.examId === exam.id && attempt.status === "in_progress",
  );
  const latest = mine[0];
  const status = [
    open ? "A sitting is still open." : "",
    latest ? `${lastSittingLine(exam, latest)} ${mine.length} saved.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={`/mock/${exam.id}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-colors group-hover:border-primary/40">
        <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold tracking-tight">{exam.title}</h2>
            <Badge variant="secondary" className="font-jp shrink-0">
              {exam.level}
            </Badge>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{exam.questionCount} questions</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              {exam.scoring.sections.map((section, index) => (
                <span key={section.id}>
                  <span className="font-jp">{section.title}</span>{" "}
                  <span className="font-mono tabular-nums">
                    {exam.minutes[index]}m
                  </span>
                </span>
              ))}
            </p>
          </div>
          {status ? <p className="text-sm">{status}</p> : null}
          <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary">
            {open ? "Continue the sitting" : "Open the paper"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function sittingCount(shown: number, total: number) {
  const noun = total === 1 ? "sitting" : "sittings";
  return `${shown} of ${total} ${noun}`;
}

function SittingFilters({
  level,
  year,
  levels,
  years,
  onLevelChange,
  onYearChange,
}: {
  level: string;
  year: string;
  levels: readonly string[];
  years: readonly string[];
  onLevelChange: (level: string) => void;
  onYearChange: (year: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full overflow-x-auto [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden">
        <SegmentedControl
          value={level}
          onValueChange={onLevelChange}
          options={[
            { value: ALL_LEVELS, label: "All levels" },
            ...levels.map((value) => ({ value, label: value })),
          ]}
          ariaLabel="Level"
          fullWidth
          className="min-w-max sm:w-fit"
        />
      </div>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger aria-label="Year" className="w-full sm:w-36">
          <SelectValue />
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
    </div>
  );
}

export function MockExamCatalog({ exams }: { exams: MockExamSummary[] }) {
  const { attempts } = useMyAttempts();
  const [level, setLevel] = useState(ALL_LEVELS);
  const [year, setYear] = useState(ALL_YEARS);
  const levels = useMemo(() => catalogLevels(exams), [exams]);
  const years = useMemo(() => catalogYears(exams), [exams]);
  const filtered = useMemo(
    () => filterMockExams(exams, { level, year }),
    [exams, level, year],
  );

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={Timer}
        title="No mock papers yet"
        description="Mock papers will show up here once added."
      />
    );
  }

  const clearFilters = () => {
    setLevel(ALL_LEVELS);
    setYear(ALL_YEARS);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <SittingFilters
          level={level}
          year={year}
          levels={levels}
          years={years}
          onLevelChange={setLevel}
          onYearChange={setYear}
        />
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {sittingCount(filtered.length, exams.length)}
        </p>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No sittings match"
          description="Try another level or year."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((exam) => (
            <li key={exam.id}>
              <ExamCard exam={exam} attempts={attempts} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
