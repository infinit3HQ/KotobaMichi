"use client";

import { useId, type ReactNode } from "react";
import { CheckCircle2, Eye, EyeOff, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { cn } from "@/lib/utils";

/** Small keyboard hint, hidden on touch-sized screens where it means nothing. */
export function KeyHint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "hidden h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[11px] font-medium text-muted-foreground sm:inline-flex",
        className
      )}
    >
      {children}
    </kbd>
  );
}

/** Topic filter for the vocabulary drills. A select keeps long topic lists usable on phones. */
export function TopicSelect({
  value,
  onValueChange,
  allLabel,
  allCount,
  topics,
}: {
  value: string;
  onValueChange: (topic: string) => void;
  allLabel: string;
  allCount: number;
  topics: { topic: string; count: number }[];
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Topic</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">
            {allLabel} ({allCount})
          </SelectItem>
          {topics.map(({ topic, count }) => (
            <SelectItem key={topic} value={topic}>
              {topic} ({count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** A row of three small numbers (time, score, accuracy and so on). */
export function StatRow({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg bg-muted/60 px-2 py-3 text-center">
          <dt className="truncate text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type AnswerState = "idle" | "correct" | "wrong" | "dimmed";

/** One multiple-choice answer. Number keys 1–4 pick it on a keyboard; tapping works everywhere. */
export function AnswerOption({
  index,
  state,
  disabled,
  onSelect,
  children,
}: {
  index: number;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-left text-sm font-medium transition-colors outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default",
        state === "idle" && "border-border hover:border-primary/40 hover:bg-accent",
        state === "correct" && "border-chart-3 bg-chart-3/10",
        state === "wrong" && "border-destructive bg-destructive/10 text-destructive",
        state === "dimmed" && "border-border opacity-50"
      )}
    >
      <span className="flex min-w-0 items-center gap-2 break-words">
        {state === "correct" ? <CheckCircle2 className="size-4 shrink-0 text-chart-3" /> : null}
        {state === "wrong" ? <XCircle className="size-4 shrink-0" /> : null}
        {children}
      </span>
      <KeyHint>{index + 1}</KeyHint>
    </button>
  );
}

export function answerState(answered: boolean, isCorrect: boolean, isPicked: boolean): AnswerState {
  if (!answered) return "idle";
  if (isCorrect) return "correct";
  if (isPicked) return "wrong";
  return "dimmed";
}

/** Shown after an answer: the right meaning, then a button to move on. */
export function AnswerFeedback({
  correct,
  answer,
  nextLabel,
  onNext,
}: {
  correct: boolean;
  answer: ReactNode;
  nextLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="space-y-3" aria-live="polite">
      <div
        className={cn(
          "rounded-lg px-4 py-3 text-left",
          correct ? "bg-chart-3/10" : "bg-destructive/10"
        )}
      >
        <p className={cn("text-xs font-medium", correct ? "text-chart-3" : "text-destructive")}>
          {correct ? "Correct" : "Not quite. The answer is"}
        </p>
        <p className="mt-0.5 text-base font-semibold leading-snug break-words">{answer}</p>
      </div>
      <Button className="w-full" onClick={onNext}>
        {nextLabel}
        <KeyHint className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">Enter</KeyHint>
      </Button>
    </div>
  );
}

/** The Japanese word being asked about, with listen and furigana controls. */
export function WordPrompt({
  text,
  reading,
  romaji,
  showReading,
  onToggleReading,
  onListen,
  meta,
}: {
  text: string;
  reading: string | null;
  romaji: string;
  showReading: boolean;
  onToggleReading: () => void;
  onListen: () => void;
  meta?: ReactNode;
}) {
  return (
    <div className="space-y-4 text-center">
      {meta ? <div className="flex flex-wrap justify-center gap-1.5">{meta}</div> : null}
      <div className="space-y-1">
        <p className={cn("font-jp text-sm text-primary", !(showReading && reading) && "invisible")} aria-hidden={!(showReading && reading)}>
          {reading ?? " "}
        </p>
        <p lang="ja" className="font-jp text-4xl font-bold leading-tight tracking-tight break-words sm:text-5xl">
          {text}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{romaji}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onListen}>
          <Volume2 />
          Listen
          <KeyHint>R</KeyHint>
        </Button>
        {reading ? (
          <Button variant="ghost" onClick={onToggleReading} aria-pressed={showReading}>
            {showReading ? <EyeOff /> : <Eye />}
            {showReading ? "Hide furigana" : "Furigana"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
