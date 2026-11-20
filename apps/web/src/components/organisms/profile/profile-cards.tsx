"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ClipboardList, LogOut, Timer } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { listMockAttempts, type RemoteMockAttempt } from "@/lib/mock-attempts";
import type { UserAttemptsResponse, UserProfile } from "@/types/api";

/** Card shell shared by the profile blocks so they all line up. */
export function ProfileCard({
  title,
  description,
  action,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="gap-4 py-4 sm:py-6">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6">
        <div className="space-y-1">
          <CardTitle className="tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}

function RowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 bg-muted" />
            <Skeleton className="h-3 w-36 bg-muted" />
          </div>
          <Skeleton className="h-8 w-16 bg-muted" />
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string | number) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function AccountCard() {
  const { t } = useLocale();
  const router = useRouter();
  const { logout } = useAuth();
  const query = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get<UserProfile>("/users/me")).data,
  });

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The session cookie may already be gone; signing out locally is still right.
    }
    logout();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <ProfileCard
      title="Account"
      action={
        <Button variant="outline" onClick={signOut}>
          <LogOut />
          {t.nav.signOut}
        </Button>
      }
    >
      {query.isLoading ? (
        <div className="space-y-2" aria-hidden>
          <Skeleton className="h-4 w-56 max-w-full bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
        </div>
      ) : query.isError || !query.data ? (
        <QueryError title="Couldn't load your profile" onRetry={() => query.refetch()} retryLabel={t.quizzes.retry} />
      ) : (
        <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium break-all">{query.data.email}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <Badge variant="secondary">{query.data.role === "ADMIN" ? "Admin" : "Student"}</Badge>
          </dd>
        </dl>
      )}
    </ProfileCard>
  );
}

export function QuizAttemptsCard() {
  const { t } = useLocale();
  const query = useQuery({
    queryKey: ["users", "me", "attempts", { page: 1, limit: 10 }],
    queryFn: async () =>
      (await api.get<UserAttemptsResponse>("/users/me/attempts", { params: { page: 1, limit: 10 } })).data,
  });

  return (
    <ProfileCard title="Recent quiz attempts" description="Your last ten quiz scores.">
      {query.isLoading ? (
        <RowsSkeleton />
      ) : query.isError ? (
        <QueryError title="Couldn't load your attempts" onRetry={() => query.refetch()} retryLabel={t.quizzes.retry} />
      ) : query.data && query.data.attempts.length > 0 ? (
        <ul className="divide-y divide-border">
          {query.data.attempts.map((attempt) => (
            <li key={attempt.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium tabular-nums">{attempt.score}%</p>
                <p className="text-xs text-muted-foreground">{formatDate(attempt.completedAt)}</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/results/${attempt.id}`}>
                  View
                  <ChevronRight />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No quiz attempts yet"
          description="Finished quizzes and their scores will appear here."
          action={
            <Button asChild variant="outline">
              <Link href="/quizzes">{t.nav.quizzes}</Link>
            </Button>
          }
        />
      )}
    </ProfileCard>
  );
}

function examLabel(examId: string) {
  const [level, year, month] = examId.split("-");
  return level && year && month ? `${level.toUpperCase()} · ${year}-${month}` : examId;
}

function MockAttemptRow({ attempt }: { attempt: RemoteMockAttempt }) {
  const scores = attempt.scores ?? [];
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium">{examLabel(attempt.examId)}</p>
        <p className="text-xs text-muted-foreground">
          {attempt.finishedAt ? formatDate(attempt.finishedAt) : "In progress"}
        </p>
        {scores.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {scores.map((score) => (
              <Badge key={score.id} variant="outline" className="font-normal tabular-nums">
                <span className="font-jp">{score.title}</span> {score.correct}/{score.total}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/mock/${attempt.examId}`}>
          Open
          <ChevronRight />
        </Link>
      </Button>
    </li>
  );
}

export function MockHistoryCard() {
  const { t } = useLocale();
  const query = useQuery({ queryKey: ["mock-exams", "attempts"], queryFn: listMockAttempts });

  return (
    <ProfileCard title="Mock exam history" description="Sittings saved to your account.">
      {query.isLoading ? (
        <RowsSkeleton />
      ) : query.isError ? (
        <QueryError title="Couldn't load your mock exams" onRetry={() => query.refetch()} retryLabel={t.quizzes.retry} />
      ) : query.data && query.data.length > 0 ? (
        <ul className="divide-y divide-border">
          {query.data.slice(0, 10).map((attempt) => (
            <MockAttemptRow key={attempt.id} attempt={attempt} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Timer}
          title="No mock exams yet"
          description="Sit a mock exam and your section scores will be kept here."
          action={
            <Button asChild variant="outline">
              <Link href="/mock">{t.nav.mock}</Link>
            </Button>
          }
        />
      )}
    </ProfileCard>
  );
}
