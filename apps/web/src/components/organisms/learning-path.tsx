"use client";

import Link from "next/link";
import { ArrowRight, CircleAlert, Route } from "lucide-react";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import { useLearning } from "@/hooks/use-learning";
import { JLPT_LEVELS, WORD_TOTALS, type LearningSummary } from "@/lib/learning";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { JLPTLevel } from "@/data/grammar";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

type DrillKey = keyof Dictionary["practice"]["drills"];

function drillTitle(t: Dictionary, mode: string | undefined) {
  if (!mode || !(mode in t.practice.drills)) return null;
  return t.practice.drills[mode as DrillKey].title;
}

function LearningPathSkeleton({ compact }: { compact: boolean }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5")}>
          {JLPT_LEVELS.map((level) => (
            <div key={level} className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LevelProgressGrid({
  summary,
  compact,
  t,
}: {
  summary: LearningSummary;
  compact: boolean;
  t: Dictionary;
}) {
  return (
    <div className={cn("grid gap-x-4 gap-y-3", compact ? "grid-cols-2 sm:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5")}>
      {summary.levels.map((row) => {
        const total = WORD_TOTALS[row.level] ?? 1;
        const percent = Math.min(100, Math.round((row.learned / total) * 100));
        return (
          <div key={row.level} className="min-w-0 space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold">{row.level}</span>
              <span className="truncate tabular-nums text-muted-foreground">{t.path.learned(row.learned, total)}</span>
            </div>
            <Progress value={percent} aria-label={`${row.level} ${t.path.learned(row.learned, total)}`} />
            {!compact && row.due > 0 ? <p className="text-xs text-muted-foreground">{t.path.due(row.due)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

/** Streak, today's count and per-level progress. `compact` is the home-page version. */
export function LearningPath({
  compact = false,
  onContinue,
}: {
  compact?: boolean;
  onContinue?: (level: JLPTLevel, mode: string) => void;
}) {
  const { t } = useLocale();
  const authChecked = useAuthStore((state) => state.authChecked);
  const { user, summary, ready } = useLearning();

  if (!user) {
    if (compact) return null;
    if (!authChecked) return <LearningPathSkeleton compact={compact} />;
    return (
      <EmptyState
        icon={Route}
        title={t.path.signInTitle}
        description={t.path.signIn}
        action={
          <Button asChild variant="outline">
            <Link href="/auth/login">{t.nav.signIn}</Link>
          </Button>
        }
      />
    );
  }

  if (!summary) {
    if (ready && !compact) {
      return (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t.path.loadError}</AlertDescription>
        </Alert>
      );
    }
    return ready ? null : <LearningPathSkeleton compact={compact} />;
  }

  const place = summary.place;
  const level = (place?.level as JLPTLevel | undefined) ?? "N5";
  const mode = place?.mode ?? "flashcard";
  const placeTitle = drillTitle(t, place?.mode);
  const continueLabel = place && placeTitle ? `${level} · ${placeTitle}` : level;
  const continueHref = `/practice?level=${level}&mode=${mode}`;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="font-semibold tracking-tight">{t.path.title}</h2>
            <p className="text-sm text-muted-foreground">
              {t.path.streak(summary.streak)}
              <span className="mx-1.5" aria-hidden>
                ·
              </span>
              {t.path.studied(summary.studiedToday)}
              <span className="mx-1.5" aria-hidden>
                ·
              </span>
              {t.path.due(summary.dueNow)}
            </p>
          </div>
          {onContinue ? (
            <Button size="sm" onClick={() => onContinue(level, mode)}>
              {t.path.continue} {continueLabel}
              <ArrowRight />
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={continueHref}>
                {t.path.continue} {continueLabel}
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>

        <LevelProgressGrid summary={summary} compact={compact} t={t} />

        {!compact ? <p className="text-xs text-muted-foreground">{t.path.newWords}</p> : null}
      </CardContent>
    </Card>
  );
}
