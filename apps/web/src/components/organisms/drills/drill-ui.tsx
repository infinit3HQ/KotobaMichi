"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Search, X, XCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Progress } from "@/components/atoms/progress";
import { cn } from "@/lib/utils";

/** The row above a drill: sub-mode switch on the left, plain count text on the right. */
export function DrillToolbar({ control, meta }: { control: ReactNode; meta?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {control}
      {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
    </div>
  );
}

/** A plain card with the drill's standard padding. */
export function DrillCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="space-y-5 p-4 sm:p-6">{children}</CardContent>
    </Card>
  );
}

/** "Question 3 / 10" with a progress bar, plus optional meta (usually the score) on the right. */
export function DrillProgress({
  label,
  current,
  total,
  meta,
}: {
  label: string;
  current: number;
  total: number;
  meta?: ReactNode;
}) {
  const value = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {label} <span className="font-medium tabular-nums text-foreground">{current} / {total}</span>
        </span>
        {meta ? <span className="tabular-nums text-muted-foreground">{meta}</span> : null}
      </div>
      <Progress value={value} aria-label={`${label} ${current} of ${total}`} className="h-1.5" />
    </div>
  );
}

export type OptionState = "idle" | "selected" | "correct" | "incorrect" | "muted";

/** Works out how an answer option should look once the question has (or hasn't) been answered. */
export function optionState(isAnswered: boolean, isChosen: boolean, isTarget: boolean): OptionState {
  if (!isAnswered) return isChosen ? "selected" : "idle";
  if (isTarget) return "correct";
  if (isChosen) return "incorrect";
  return "muted";
}

const OPTION_STATE_CLASSES: Record<OptionState, string> = {
  idle: "",
  selected: "border-primary bg-primary/10 text-foreground hover:bg-primary/15",
  correct: "border-chart-3 bg-chart-3/10 text-foreground disabled:opacity-100",
  incorrect: "border-destructive bg-destructive/10 text-foreground disabled:opacity-100",
  muted: "disabled:opacity-50",
};

/** A full-width outline answer button that wraps long Japanese text. */
export function AnswerOption({
  state,
  onClick,
  disabled,
  marker,
  align = "start",
  className,
  children,
}: {
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
  /** Small number or letter shown at the right edge. */
  marker?: ReactNode;
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected" ? true : undefined}
      className={cn(
        "h-auto min-h-11 w-full gap-3 py-2.5 whitespace-normal",
        align === "start" ? "justify-between text-left" : "justify-center text-center",
        OPTION_STATE_CLASSES[state],
        className
      )}
    >
      <span className="min-w-0 break-words">{children}</span>
      {state === "correct" ? (
        <CheckCircle2 className="text-chart-3" aria-label="Correct answer" />
      ) : state === "incorrect" ? (
        <XCircle className="text-destructive" aria-label="Your answer" />
      ) : marker != null ? (
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{marker}</span>
      ) : null}
    </Button>
  );
}

/** Green or red result line shown after answering. */
export function FeedbackBanner({
  correct,
  title,
  children,
}: {
  correct: boolean;
  title: ReactNode;
  children?: ReactNode;
}) {
  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm",
        correct ? "border-chart-3 bg-chart-3/10" : "border-destructive bg-destructive/10"
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", correct ? "text-chart-3" : "text-destructive")} />
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{title}</p>
        {children ? <div className="text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}

/** Muted block for grammar notes, clues and explanations. */
export function ExplanationBlock({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 rounded-lg bg-muted/50 p-4 text-sm", className)}>
      {title || action ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title ? <p className="font-medium">{title}</p> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Bottom row of a drill card: secondary actions left, primary action right. */
export function DrillFooter({ start, end }: { start?: ReactNode; end?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
      <div className="flex flex-wrap items-center gap-2">{start}</div>
      <div className="ml-auto flex flex-wrap items-center gap-2">{end}</div>
    </div>
  );
}

/** Search box with an icon and a clear button, full width on phones. */
export function DrillSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pr-9 pl-9"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-0.5 size-8 -translate-y-1/2 text-muted-foreground"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
