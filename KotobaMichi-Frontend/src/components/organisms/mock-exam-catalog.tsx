"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPoints, pointsForSection, scoreByMondai, scoreExam, type MockExamSummary } from "@/lib/mock-exam";
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
        const latestRows = latest ? scoreByMondai(exam.scoring, latest.answers ?? {}) : [];
        const latestEstimate = latest
          ? scoreExam(exam.scoring, latest.answers ?? {}).reduce((sum, score) => sum + pointsForSection(latestRows, score.id), 0)
          : 0;
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
                  {latest ? `Last estimate ${formatPoints(latestEstimate)}/180. ${mine.length} saved.` : ""}
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
