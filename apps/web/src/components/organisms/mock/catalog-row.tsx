"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent } from "@/components/atoms/card";
import type { RemoteMockAttempt } from "@/lib/mock-attempts";
import type { ExamAttempts } from "@/lib/mock-catalog-view";
import { sittingMonth } from "@/lib/mock-catalog-view";
import { formatPoints, paperPoints, SECTION_POINTS, type MockExamSummary } from "@/lib/mock-exam";
import { completedFromSave, summarizeSitting } from "@/lib/mock-sitting";

/** "112.4/180" for a full sitting, or "聴解 41.2/60" for a partial one. */
function lastScore(exam: MockExamSummary, attempt: RemoteMockAttempt) {
  const completed = completedFromSave(exam.scoring, { ...attempt, finished: true });
  const summary = summarizeSitting(exam.scoring, attempt.answers ?? {}, completed);
  if (summary.total != null) {
    return `${formatPoints(summary.total)}/${paperPoints(exam.scoring.sections.length)}`;
  }
  const taken = summary.sections
    .filter((section) => section.points != null)
    .map((section) => `${section.title} ${formatPoints(section.points ?? 0)}/${SECTION_POINTS}`);
  return taken.join("、") || "no section";
}

function RowStatus({ exam, entry }: { exam: MockExamSummary; entry: ExamAttempts<RemoteMockAttempt> | undefined }) {
  if (entry?.open) {
    return (
      <Badge variant="outline" className="border-primary/40 text-primary">
        In progress
      </Badge>
    );
  }
  const latest = entry?.finished[0];
  if (!latest) return null;
  return (
    <span className="text-right text-xs text-muted-foreground">
      <span className="font-mono tabular-nums text-foreground">{lastScore(exam, latest)}</span>
      {latest.mode === "practice" ? " · practice" : null}
      {entry.finished.length > 1 ? (
        <span className="hidden sm:inline"> · {entry.finished.length} sittings</span>
      ) : null}
    </span>
  );
}

/** One paper as a compact row: level, month, section clocks, and where the student stands. */
export function CatalogRow({
  exam,
  entry,
}: {
  exam: MockExamSummary;
  entry: ExamAttempts<RemoteMockAttempt> | undefined;
}) {
  const month = sittingMonth(exam.id);
  return (
    <Link
      href={`/mock/${exam.id}`}
      className="group flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:px-5"
    >
      <Badge variant="secondary" className="w-9 shrink-0 justify-center font-jp">
        {exam.level}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {month ? `${month} ${exam.year}` : exam.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {exam.questionCount} questions
          <span className="hidden sm:inline">
            {exam.scoring.sections.map((section, index) => (
              <span key={section.id}>
                {" · "}
                <span className="font-jp">{section.title}</span>{" "}
                <span className="font-mono tabular-nums">{exam.minutes[index]}m</span>
              </span>
            ))}
          </span>
        </p>
      </div>
      <RowStatus exam={exam} entry={entry} />
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

/** Open sittings, pinned above the filters so they are one tap away. */
export function ContinueStrip({ exams }: { exams: readonly MockExamSummary[] }) {
  if (exams.length === 0) return null;
  return (
    <section className="space-y-2" aria-label="Sittings in progress">
      <p className="text-sm font-medium">Pick up where you left off</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {exams.map((exam) => (
          <li key={exam.id}>
            <Link
              href={`/mock/${exam.id}`}
              className="group block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Card className="gap-0 border-primary/40 py-0 transition-colors group-hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                  <Badge variant="secondary" className="font-jp">
                    {exam.level}
                  </Badge>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{exam.title}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <Play className="size-3.5" aria-hidden />
                    Continue
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
