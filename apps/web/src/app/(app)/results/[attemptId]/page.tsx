"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { ResultReviewList, ResultSummaryCard } from "@/components/organisms/quizzes/result-review";
import { useResultsStore } from "@/stores/results";

export default function QuizResultsPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string;
  const { t } = useLocale();
  const result = useResultsStore((s) => s.get(attemptId));

  const backButton = (
    <Button asChild variant="outline">
      <Link href="/quizzes">
        <ArrowLeft />
        {t.quizzes.backToQuizzes}
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="結果"
        title={t.quizzes.resultsTitle}
        description={result ? t.quizzes.resultsDesc : undefined}
        actions={result ? backButton : undefined}
      />
      {result ? (
        <>
          <ResultSummaryCard result={result} />
          <section className="space-y-4">
            <SectionHeading title={t.quizzes.review} meta={t.quizzes.wordCount(result.results.length)} />
            <ResultReviewList items={result.results} />
          </section>
        </>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title={t.quizzes.resultsMissingTitle}
          description={t.quizzes.resultsMissingBody}
          action={
            <Button asChild>
              <Link href="/quizzes">{t.quizzes.backToQuizzes}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
