"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  formatPoints,
  paperPoints,
  SECTION_POINTS,
  type MockExamSummary,
} from "@/lib/mock-exam";
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

export function MockExamCatalog({ exams }: { exams: MockExamSummary[] }) {
  const { attempts } = useMyAttempts();

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={Timer}
        title="No mock papers yet"
        description="Mock papers will show up here once added."
      />
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {exams.map((exam) => (
        <li key={exam.id}>
          <ExamCard exam={exam} attempts={attempts} />
        </li>
      ))}
    </ul>
  );
}
