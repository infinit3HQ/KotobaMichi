"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPoints, SECTION_POINTS, type MockExamSummary } from "@/lib/mock-exam";
import { completedFromSave, summarizeSitting } from "@/lib/mock-sitting";
import { listMockAttempts, type RemoteMockAttempt } from "@/lib/mock-attempts";
import { useAuthStore } from "@/stores/auth";

export function MockExamCatalog({ exams }: { exams: MockExamSummary[] }) {
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

  return (
    <ul className="space-y-3">
      {exams.map((exam) => {
        const mine = attempts.filter((attempt) => attempt.examId === exam.id && attempt.status === "finished");
        const open = attempts.find((attempt) => attempt.examId === exam.id && attempt.status === "in_progress");
        const latest = mine[0];
        const latestLine = latest ? lastSittingLine(exam, latest) : "";
        return (
          <li key={exam.id}>
            <Link
              href={`/mock/${exam.id}`}
              className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{exam.title}</h2>
                <span className="font-jp text-sm text-muted-foreground">{exam.level}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {exam.questionCount} questions · reconstructed mock
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {exam.minutes.map((minutes) => `${minutes}m`).join(" · ")}
              </p>
              {user && (open || latest) && (
                <p className="mt-3 text-sm">
                  {open ? "A sitting is still open. " : ""}
                  {latest ? `${latestLine} ${mine.length} saved.` : ""}
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** "Last estimate 112.4/180." for a full sitting, or "Last sitting: 聴解 41.2/60." for a partial one. */
function lastSittingLine(exam: MockExamSummary, attempt: RemoteMockAttempt) {
  const completed = completedFromSave(exam.scoring, { ...attempt, finished: true });
  const summary = summarizeSitting(exam.scoring, attempt.answers ?? {}, completed);
  if (summary.total != null) return `Last estimate ${formatPoints(summary.total)}/180.`;
  const taken = summary.sections
    .filter((section) => section.points != null)
    .map((section) => `${section.title} ${formatPoints(section.points ?? 0)}/${SECTION_POINTS}`);
  return `Last sitting: ${taken.join(", ") || "no section"}.`;
}
