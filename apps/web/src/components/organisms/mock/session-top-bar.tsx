"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { formatClock } from "@/lib/mock-exam";
import { cn } from "@/lib/utils";

type SessionTopBarProps = {
  sectionTitle: string;
  sectionNumber: number;
  sectionCount: number;
  mondaiNumber: number | null;
  remaining: number;
  answered: number;
  totalItems: number;
  focus: boolean;
  confirmEnd: boolean;
  /** Pin below the site navbar (off in focus mode, where the bar already sits at the top). */
  pinned: boolean;
  onToggleFocus: () => void;
  onAskFinish: () => void;
  onCancelFinish: () => void;
  onConfirmFinish: () => void;
};

function clockTone(remaining: number) {
  if (remaining < 60_000) return "bg-destructive text-white";
  if (remaining < 5 * 60_000) return "bg-primary/10 text-primary";
  return "bg-muted text-foreground";
}

/** Timer, progress and the finish control for a running section. Stays in view while scrolling. */
export function SessionTopBar({
  sectionTitle,
  sectionNumber,
  sectionCount,
  mondaiNumber,
  remaining,
  answered,
  totalItems,
  focus,
  confirmEnd,
  pinned,
  onToggleFocus,
  onAskFinish,
  onCancelFinish,
  onConfirmFinish,
}: SessionTopBarProps) {
  const percent = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;
  return (
    <header
      className={cn(
        "z-30 border-b border-border bg-background",
        pinned && "sticky top-14 -mx-4 sm:mx-0 sm:rounded-t-xl"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2 sm:gap-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-jp text-sm font-semibold">{sectionTitle}</p>
          <p className="truncate text-xs text-muted-foreground">
            Section {sectionNumber} of {sectionCount}
            {mondaiNumber != null ? <span className="font-jp"> · 問題{mondaiNumber}</span> : null}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 items-center rounded-md px-2.5 font-mono text-base font-semibold tabular-nums sm:text-lg",
            clockTone(remaining)
          )}
          aria-live="polite"
          aria-label={`Time left ${formatClock(remaining)}`}
        >
          {formatClock(remaining)}
        </div>
        <Button type="button" variant={confirmEnd ? "secondary" : "outline"} onClick={onAskFinish}>
          Finish
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={focus ? "Leave focus mode" : "Enter focus mode"}
          onClick={onToggleFocus}
        >
          {focus ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
      <div className="flex items-center gap-3 px-4 pb-2 sm:px-5">
        <Progress value={percent} className="h-1.5 flex-1" aria-label="Questions answered" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {answered}/{totalItems}
        </span>
      </div>
      {confirmEnd && (
        <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm">
            Close <span className="font-jp">{sectionTitle}</span>?{" "}
            <span className="font-mono tabular-nums">{formatClock(remaining)}</span> will not carry over.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={onCancelFinish}>
              Keep working
            </Button>
            <Button type="button" className="flex-1 sm:flex-none" onClick={onConfirmFinish}>
              Close section
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
