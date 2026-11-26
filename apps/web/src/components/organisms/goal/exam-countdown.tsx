"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { useLoopText } from "@/hooks/use-loop-text";
import {
  PASS_TOTALS,
  daysUntil,
  examLabel,
  nextMockIn,
  predictPass,
  scoreTrend,
  toDay,
  wordPace,
  type PlanAttempt,
} from "@/lib/exam-plan";
import type { LearningSummary } from "@/lib/learning";
import type { LoopText } from "@/lib/i18n/loop-text";
import { planLevel } from "@/lib/today";
import { cn } from "@/lib/utils";

function dateLine(text: LoopText, examDate: string | null, today: string) {
  if (!examDate) return null;
  const days = daysUntil(examDate, today);
  if (days < 0) return text.countdown.examPassed;
  if (days === 0) return text.countdown.examToday;
  return text.countdown.daysLeft(days);
}

function paceLine(text: LoopText, pace: ReturnType<typeof wordPace>, level: string) {
  if (pace.left === 0) return text.countdown.allLearned(level);
  if (pace.perDay == null) return text.countdown.noDate;
  return text.countdown.pace(pace.perDay, level);
}

/** A row of bars for each finished mock at the level, out of 180. */
function ScoreBars({ trend, passTotal }: { trend: ReturnType<typeof scoreTrend>; passTotal: number }) {
  const recent = trend.slice(-8);
  return (
    <div className="flex h-16 items-end gap-1.5" role="img" aria-label={recent.map((t) => `${examLabel(t.examId)} ${t.total}`).join(", ")}>
      {recent.map((point) => (
        <div
          key={`${point.examId}-${point.finishedAt}`}
          title={`${examLabel(point.examId)}: ${point.total}/180`}
          className={cn("w-full max-w-8 rounded-sm", point.total >= passTotal ? "bg-chart-3" : "bg-primary/60")}
          style={{ height: `${Math.max(6, (point.total / 180) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** Days to the exam, the word pace that gets there, and a pass estimate from recent mocks. */
export function ExamCountdown({ summary, attempts }: { summary: LearningSummary; attempts: readonly PlanAttempt[] }) {
  const text = useLoopText();
  const today = toDay(new Date());
  const level = planLevel(summary);
  const examDate = summary.goal?.examDate ?? null;
  const learned = summary.levels.find((row) => row.level === level)?.learned ?? 0;
  const pace = wordPace(level, learned, examDate, today);
  const prediction = predictPass(attempts, level);
  const trend = scoreTrend(attempts, level);
  const hasMocks = PASS_TOTALS[level] != null;
  const mockDays = nextMockIn(attempts, level);
  const headline = dateLine(text, examDate, today);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {text.countdown.title} · {level}
            </p>
            <p className="text-2xl font-semibold tracking-tight">{headline ?? text.countdown.noDate}</p>
          </div>
          {prediction ? (
            <Badge variant={prediction.passes ? "secondary" : "outline"} className={prediction.passes ? "text-chart-3" : "text-destructive"}>
              {prediction.total}/180
            </Badge>
          ) : null}
        </div>

        {headline ? <p className="text-sm leading-relaxed">{paceLine(text, pace, level)}</p> : null}

        {hasMocks ? (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">{text.countdown.estimate}</p>
            {prediction ? (
              <>
                <p className="text-sm">
                  {prediction.passes
                    ? text.countdown.passLikely(prediction.total, prediction.passTotal)
                    : text.countdown.passNotYet(prediction.total, prediction.passTotal)}{" "}
                  <span className="text-muted-foreground">{text.countdown.fromSittings(prediction.sittings)}</span>
                </p>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {prediction.sections.map((section) => (
                    <li key={section.id} className="flex items-baseline justify-between rounded-lg border border-border px-3 py-2">
                      <span className="font-jp text-sm">{section.title}</span>
                      <span className={cn("font-mono text-sm tabular-nums", !section.passes && "text-destructive")}>
                        {section.points}/60
                      </span>
                    </li>
                  ))}
                </ul>
                {trend.length > 1 ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{text.countdown.trend}</p>
                    <ScoreBars trend={trend} passTotal={prediction.passTotal} />
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{text.countdown.noMocks}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{mockDays === 0 ? text.countdown.mockNow : text.countdown.mockIn(mockDays)}</p>
              {mockDays === 0 ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/mock?level=${level}`}>{text.countdown.sitMock}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">{text.countdown.noMocksForLevel(level)}</p>
        )}
      </CardContent>
    </Card>
  );
}
