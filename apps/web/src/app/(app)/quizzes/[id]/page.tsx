"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Layers } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { QuizDetail, SubmitAnswer, SubmitQuizResponse } from "@/types/api";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { buildQuizOptions } from "@/components/organisms/quizzes/quiz-options";
import { QuizQuestionCard, QuizTakingSkeleton } from "@/components/organisms/quizzes/quiz-question-card";
import { useResultsStore } from "@/stores/results";
import { track } from "@/lib/analytics/posthog";

export default function QuizTakingPage() {
  const params = useParams();
  const id = params?.id as string;
  const { t } = useLocale();
  const query = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => (await api.get<QuizDetail>(`/quizzes/${id}`)).data,
  });

  const backButton = (
    <Button asChild variant="outline">
      <Link href="/quizzes">
        <ArrowLeft />
        {t.quizzes.backToQuizzes}
      </Link>
    </Button>
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          eyebrow={t.quizzes.kicker}
          title={query.data?.title ?? t.quizzes.title}
          description={query.data?.description ?? undefined}
          actions={backButton}
        />
        {query.isLoading ? (
          <QuizTakingSkeleton />
        ) : query.isError || !query.data ? (
          <QueryError
            title={t.quizzes.quizLoadError}
            description={t.quizzes.loadErrorBody}
            onRetry={() => query.refetch()}
            retryLabel={t.quizzes.retry}
          />
        ) : query.data.quizWords.length === 0 ? (
          <EmptyState icon={Layers} title={t.quizzes.noWords} description={t.quizzes.noWordsBody} />
        ) : (
          <QuizRunner quiz={query.data} />
        )}
      </div>
    </ProtectedRoute>
  );
}

function QuizRunner({ quiz }: { quiz: QuizDetail }) {
  const { t } = useLocale();
  const router = useRouter();
  const words = quiz.quizWords;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const optionsByWord = useMemo(
    () => Object.fromEntries(words.map((qw) => [qw.wordId, buildQuizOptions(words, qw.wordId)])),
    [words]
  );

  const mutation = useMutation({
    mutationFn: async (payload: SubmitAnswer[]) =>
      (await api.post<SubmitQuizResponse>(`/quizzes/${quiz.id}/submit`, { answers: payload })).data,
    onSuccess: (res) => {
      track("quiz_submitted", { quiz_id: quiz.id, score: res.score, total_questions: res.totalQuestions,
        percent: res.totalQuestions ? Math.round((res.score / res.totalQuestions) * 100) : 0,
      });
      toast.success(t.quizzes.submitted);
      // Keep the detailed breakdown in memory so the results page can render it.
      useResultsStore.getState().save(res);
      router.push(`/results/${res.attemptId}`);
    },
    onError: () => toast.error(t.quizzes.submitFailed),
  });

  const current = words[index];
  const isLast = index === words.length - 1;
  const answeredCount = words.filter((qw) => (answers[qw.wordId] ?? "").trim().length > 0).length;

  const onAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [current.wordId]: value }));
  const onSubmit = () =>
    mutation.mutate(words.map((qw) => ({ wordId: qw.wordId, answer: answers[qw.wordId] ?? "" })));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
          <span className="font-medium tabular-nums">{t.quizzes.question(index + 1, words.length)}</span>
          <span className="text-muted-foreground tabular-nums">{t.quizzes.answered(answeredCount, words.length)}</span>
        </div>
        <Progress value={((index + 1) / words.length) * 100} aria-label={t.quizzes.question(index + 1, words.length)} />
      </div>

      <QuizQuestionCard
        key={current.wordId}
        word={current.word}
        options={optionsByWord[current.wordId] ?? []}
        answer={answers[current.wordId] ?? ""}
        onAnswer={onAnswer}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          {t.quizzes.previous}
        </Button>
        {isLast ? (
          <Button className="flex-1 sm:flex-none" onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? t.quizzes.submitting : t.quizzes.submit}
          </Button>
        ) : (
          <Button className="flex-1 sm:flex-none" onClick={() => setIndex((i) => Math.min(i + 1, words.length - 1))}>
            {t.quizzes.next}
          </Button>
        )}
      </div>
    </div>
  );
}
