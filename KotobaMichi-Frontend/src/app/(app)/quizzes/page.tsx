"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QuizSummary } from "@/types/api";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/atoms/button";
import { Plus, Sparkles, Layers, ArrowRight, Trophy } from "lucide-react";

export default function QuizListPage() {
  const { user } = useAuth();
  const {
    data: publicQuizzes,
    isLoading: loadingPublic,
    isError: errorPublic,
  } = useQuery({
    queryKey: ["quizzes", "public"],
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes")).data,
  });
  const { data: myQuizzes, isLoading: loadingMine } = useQuery({
    queryKey: ["quizzes", "mine"],
    queryFn: async () =>
      (await api.get<QuizSummary[]>("/quizzes/my-quizzes")).data,
    enabled: !!user,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-jp text-primary text-xs font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              問題集 · Quizzes
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Spaced Repetition Quizzes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Test your vocabulary mastery with active recall evaluations and score breakdown.
          </p>
        </div>

        <div>
          {user ? (
            <Button asChild className="gap-2 shadow-xs bg-primary hover:bg-primary/90">
              <Link href="/quizzes/create">
                <Plus className="h-4 w-4" />
                Create Quiz
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="text-xs">
              <Link href="/auth/login">Login to create quiz</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Public Quizzes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Curated Community Quizzes
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {publicQuizzes?.length || 0} available
          </span>
        </div>

        {loadingPublic ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : errorPublic ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Failed to load public quizzes. Please try again later.
          </div>
        ) : publicQuizzes && publicQuizzes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {publicQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No public quizzes available yet.
          </div>
        )}
      </div>

      {/* My Quizzes Section */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              My Custom Quizzes
            </h2>
          </div>
          {user && (
            <span className="text-xs text-muted-foreground font-mono">
              {myQuizzes?.length || 0} created
            </span>
          )}
        </div>

        {!user ? (
          <div className="rounded-2xl border border-border/80 bg-card/50 p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to author personal quizzes, save custom word lists, and track scores.
            </p>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        ) : loadingMine ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : myQuizzes && myQuizzes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {myQuizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-card/30 p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t created any custom quizzes yet.
            </p>
            <Button asChild size="sm" className="text-xs gap-1.5">
              <Link href="/quizzes/create">
                <Plus className="h-3.5 w-3.5" />
                Build your first quiz
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: QuizSummary }) {
  return (
    <Card className="border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              {quiz._count.quizWords ?? 0} Words
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500 opacity-80" />
              {quiz._count.attempts ?? 0} attempts
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {quiz.title}
          </h3>

          {quiz.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {quiz.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Multiple Choice</span>
          <Button asChild size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-primary font-semibold gap-1 group-hover:bg-primary/10">
            <Link href={`/quizzes/${quiz.id}`}>
              <span>Start Quiz</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
