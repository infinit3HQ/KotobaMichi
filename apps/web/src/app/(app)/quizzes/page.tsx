"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Layers, LogIn, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { QuizSummary } from "@/types/api";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { QuizCardGrid, QuizCardGridSkeleton } from "@/components/organisms/quizzes/quiz-card";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth";

export default function QuizListPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const authChecked = useAuthStore((state) => state.authChecked);

  const publicQuery = useQuery({
    queryKey: ["quizzes", "public"],
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes")).data,
  });
  const mineQuery = useQuery({
    queryKey: ["quizzes", "mine"],
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes/my-quizzes")).data,
    enabled: !!user,
  });

  const headerAction = !authChecked ? null : user ? (
    <Button asChild>
      <Link href="/quizzes/create">
        <Plus />
        {t.quizzes.create}
      </Link>
    </Button>
  ) : (
    <Button asChild variant="outline">
      <Link href="/auth/login">{t.quizzes.loginToCreate}</Link>
    </Button>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={t.quizzes.kicker}
        title={t.quizzes.title}
        description={t.quizzes.desc}
        actions={headerAction}
      />

      <section className="space-y-4">
        <SectionHeading
          title={t.quizzes.community}
          meta={publicQuery.data ? t.quizzes.available(publicQuery.data.length) : null}
        />
        {publicQuery.isLoading ? (
          <QuizCardGridSkeleton count={3} />
        ) : publicQuery.isError ? (
          <QueryError
            title={t.quizzes.loadError}
            description={t.quizzes.loadErrorBody}
            onRetry={() => publicQuery.refetch()}
            retryLabel={t.quizzes.retry}
          />
        ) : publicQuery.data && publicQuery.data.length > 0 ? (
          <QuizCardGrid quizzes={publicQuery.data} />
        ) : (
          <EmptyState icon={Layers} title={t.quizzes.emptyPublicTitle} description={t.quizzes.emptyPublicBody} />
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          title={t.quizzes.mine}
          meta={user && mineQuery.data ? t.quizzes.mineCount(mineQuery.data.length) : null}
        />
        <MyQuizzes
          authChecked={authChecked}
          signedIn={!!user}
          isLoading={mineQuery.isLoading}
          isError={mineQuery.isError}
          quizzes={mineQuery.data}
          onRetry={() => mineQuery.refetch()}
        />
      </section>
    </div>
  );
}

function MyQuizzes({
  authChecked,
  signedIn,
  isLoading,
  isError,
  quizzes,
  onRetry,
}: {
  authChecked: boolean;
  signedIn: boolean;
  isLoading: boolean;
  isError: boolean;
  quizzes?: QuizSummary[];
  onRetry: () => void;
}) {
  const { t } = useLocale();

  if (!authChecked || (signedIn && isLoading)) return <QuizCardGridSkeleton count={2} />;

  if (!signedIn) {
    return (
      <EmptyState
        icon={LogIn}
        title={t.quizzes.signInTitle}
        description={t.quizzes.signInBody}
        action={
          <Button asChild variant="outline">
            <Link href="/auth/login">{t.quizzes.signIn}</Link>
          </Button>
        }
      />
    );
  }

  if (isError) {
    return (
      <QueryError
        title={t.quizzes.loadError}
        description={t.quizzes.loadErrorBody}
        onRetry={onRetry}
        retryLabel={t.quizzes.retry}
      />
    );
  }

  if (quizzes && quizzes.length > 0) return <QuizCardGrid quizzes={quizzes} />;

  return (
    <EmptyState
      icon={Plus}
      title={t.quizzes.emptyMineTitle}
      description={t.quizzes.emptyMineBody}
      action={
        <Button asChild>
          <Link href="/quizzes/create">
            <Plus />
            {t.quizzes.buildFirst}
          </Link>
        </Button>
      }
    />
  );
}
