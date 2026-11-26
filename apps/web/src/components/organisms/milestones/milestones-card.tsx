"use client";

import { useEffect } from "react";
import { Award, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { useLoopText } from "@/hooks/use-loop-text";
import type { PlanAttempt } from "@/lib/exam-plan";
import type { LoopText } from "@/lib/i18n/loop-text";
import type { LearningSummary } from "@/lib/learning";
import { milestones, newlyEarned, nextMilestone, type Milestone } from "@/lib/milestones";
import { cn } from "@/lib/utils";

const SEEN_KEY = "kotobamichi:milestones-seen";

export function milestoneName(milestone: Milestone, text: LoopText) {
  switch (milestone.kind) {
    case "streak":
      return text.milestones.streak(Number(milestone.value));
    case "words":
      return text.milestones.words(Number(milestone.value));
    case "level":
      return text.milestones.level(String(milestone.value));
    case "firstMock":
      return text.milestones.firstMock;
    case "mockPass":
      return text.milestones.mockPass;
  }
}

function readSeen(): string[] | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : null;
  } catch {
    return null;
  }
}

function writeSeen(ids: string[]) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked; the toast may then repeat, which is harmless.
  }
}

/**
 * Toasts milestones earned since the last visit on this device.
 * The first visit only records what is already earned, so old milestones never toast.
 */
export function useMilestoneToasts(list: readonly Milestone[] | null) {
  const text = useLoopText();
  useEffect(() => {
    if (!list) return;
    const earned = list.filter((m) => m.earned).map((m) => m.id);
    const seen = readSeen();
    if (seen) {
      for (const milestone of newlyEarned(list, seen)) {
        toast.success(text.milestones.toast(milestoneName(milestone, text)));
      }
    }
    writeSeen(earned);
  }, [list, text]);
}

function MilestoneTile({ milestone, text }: { milestone: Milestone; text: LoopText }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        milestone.earned ? "border-primary/30 bg-primary/5" : "border-border text-muted-foreground"
      )}
    >
      {milestone.earned ? <Award className="size-4 shrink-0 text-primary" /> : <Lock className="size-4 shrink-0" />}
      <span className="min-w-0 flex-1 truncate text-sm">{milestoneName(milestone, text)}</span>
      {!milestone.earned ? (
        <span className="shrink-0 font-mono text-xs tabular-nums">
          {milestone.current}/{milestone.target}
        </span>
      ) : null}
    </li>
  );
}

export function MilestonesCard({ summary, attempts }: { summary: LearningSummary; attempts: readonly PlanAttempt[] }) {
  const text = useLoopText();
  const list = milestones(summary, attempts);
  const next = nextMilestone(list);
  const earnedCount = list.filter((m) => m.earned).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.milestones.title}</CardTitle>
        <CardDescription>{text.milestones.earned(earnedCount, list.length)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {next ? (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span>
                <span className="text-muted-foreground">{text.milestones.next}: </span>
                {milestoneName(next, text)}
              </span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {next.current}/{next.target}
              </span>
            </div>
            <Progress value={(next.current / next.target) * 100} aria-label={milestoneName(next, text)} />
          </div>
        ) : null}
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((milestone) => (
            <MilestoneTile key={milestone.id} milestone={milestone} text={text} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
