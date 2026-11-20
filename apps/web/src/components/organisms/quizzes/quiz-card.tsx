"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { useLocale } from "@/components/organisms/locale-provider";
import type { QuizSummary } from "@/types/api";

const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

/** One quiz in a list: the whole card links to the quiz. */
export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const { t } = useLocale();
  const words = quiz._count.quizWords ?? 0;
  const attempts = quiz._count.attempts ?? 0;

  return (
    <Link
      href={`/quizzes/${quiz.id}`}
      className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-colors group-hover:border-primary/40">
        <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 font-semibold tracking-tight break-words">{quiz.title}</h3>
            {quiz.description ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground break-words">
                {quiz.description}
              </p>
            ) : null}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground tabular-nums">
              {t.quizzes.wordCount(words)} · {t.quizzes.attemptCount(attempts)}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              {t.quizzes.start}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function QuizCardGrid({ quizzes }: { quizzes: QuizSummary[] }) {
  return (
    <div className={GRID}>
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}

/** Loading placeholder with the same shape as a row of quiz cards. */
export function QuizCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="gap-0 py-0">
          <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
            <Skeleton className="h-5 w-2/3 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3.5 w-28 bg-muted" />
              <Skeleton className="h-4 w-20 bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
