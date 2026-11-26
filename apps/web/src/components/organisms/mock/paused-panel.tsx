"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { formatClock } from "@/lib/mock-exam";

/** Stands in for the questions while a practice clock is paused, so no answers go in off the clock. */
export function PausedPanel({ remaining, onResume }: { remaining: number; onResume: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <Pause className="size-6 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold">Paused</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono tabular-nums">{formatClock(remaining)}</span> left in this section. The questions
          come back when you resume.
        </p>
      </div>
      <Button type="button" onClick={onResume} autoFocus>
        <Play />
        Resume
      </Button>
    </div>
  );
}
