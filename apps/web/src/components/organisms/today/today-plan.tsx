"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame, Snowflake, Target } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";
import { useLocale } from "@/components/organisms/locale-provider";
import { useLoopText } from "@/hooks/use-loop-text";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { LoopText } from "@/lib/i18n/loop-text";
import { DEFAULT_GOAL, type LearningSummary } from "@/lib/learning";
import { dayProgress, nextTask, todayTasks, type TodayTask } from "@/lib/today";
import { cn } from "@/lib/utils";

type DrillKey = keyof Dictionary["practice"]["drills"];

function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function taskLabel(task: TodayTask, text: LoopText, t: Dictionary) {
  const count = task.count ?? 0;
  switch (task.id) {
    case "reviews":
      return task.done ? text.today.reviewsDone : text.today.reviews(count);
    case "mistakes":
      return task.done ? text.today.mistakesDone : text.today.mistakes(count);
    case "new":
      return task.done ? text.today.newWordsDone : text.today.newWords(count);
    case "drill": {
      const mode = new URLSearchParams(task.href.split("?")[1]).get("mode") ?? "grammar";
      const title = mode in t.practice.drills ? t.practice.drills[mode as DrillKey].title : mode;
      return text.today.drill(title);
    }
  }
}

function StreakLine({ summary, text }: { summary: LearningSummary; text: LoopText }) {
  const freezes = summary.freezes ?? 0;
  const needed = summary.freezesNeeded ?? 0;
  return (
    <div className="space-y-1">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Flame className={cn("size-4", summary.streak > 0 && "text-primary")} />
          {text.today.streak(summary.streak)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Snowflake className={cn("size-4", freezes > 0 && "text-sky-500")} />
              {text.today.freezes(freezes)}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{text.today.freezeHint}</TooltipContent>
        </Tooltip>
      </p>
      {needed > 0 ? <p className="text-xs text-sky-600 dark:text-sky-400">{text.today.freezeCovers(needed)}</p> : null}
    </div>
  );
}

export function TodayPlanSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex gap-4 p-4 sm:p-5">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

/** One card with today's work in order and a single Start button. */
export function TodayPlan({ summary, weakDrill }: { summary: LearningSummary; weakDrill: string | null }) {
  const text = useLoopText();
  const { t } = useLocale();
  const tasks = todayTasks(summary, weakDrill);
  const next = nextTask(tasks);
  const progress = dayProgress(summary);
  const goal = summary.goal?.dailyGoal ?? DEFAULT_GOAL.dailyGoal;
  const finished = progress >= 1 && tasks.every((task) => task.id === "drill" || task.done);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <ProgressRing value={progress} label={text.today.cards(summary.studiedToday, goal)} />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{finished ? text.today.allDone : text.today.title}</h2>
            <p className="text-sm text-muted-foreground">
              {finished ? text.today.allDoneBody : text.today.cards(summary.studiedToday, goal)}
            </p>
            <StreakLine summary={summary} text={text} />
          </div>
        </div>

        <ol className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={task.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-primary/40",
                  task.done && "text-muted-foreground",
                  next?.id === task.id && "border-primary/40 bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    task.done ? "border-chart-3 bg-chart-3 text-white" : "border-muted-foreground/40"
                  )}
                >
                  {task.done ? <Check className="size-3" /> : null}
                </span>
                <span className={cn("flex-1", task.done && "line-through decoration-muted-foreground/40")}>{taskLabel(task, text, t)}</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {summary.goal?.targetLevel ? (
            <span />
          ) : (
            <Link href="/profile#goal" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Target className="size-4" />
              {text.today.setGoal}
            </Link>
          )}
          {next ? (
            <Button asChild>
              <Link href={next.href}>
                {text.today.start}
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
