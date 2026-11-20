"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type FlipCardProps = {
  flipped: boolean;
  onToggle: () => void;
  label: string;
  front: ReactNode;
  back: ReactNode;
  /** Fixed height class so the virtualised grid can use a constant row height. */
  heightClass: string;
};

const FACE =
  "backface-hidden absolute inset-0 flex flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-sm";

/** A card that turns over on tap or Enter/Space. Both faces are shadcn-style cards. */
export function FlipCard({ flipped, onToggle, label, front, back, heightClass }: FlipCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={label}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group perspective cursor-pointer rounded-xl outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        heightClass
      )}
    >
      <div
        className={cn(
          "preserve-3d relative h-full w-full transition-transform duration-500 motion-reduce:transition-none",
          flipped && "rotate-y-180"
        )}
      >
        <div className={cn(FACE, "transition-colors group-hover:border-primary/40")} inert={flipped}>
          {front}
        </div>
        <div className={cn(FACE, "rotate-y-180 border-primary/30")} inert={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}

/** Small footer line at the bottom of a flip-card face. */
export function FlipHint({ start, hint }: { start?: ReactNode; hint: string }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
      <span className="min-w-0 truncate">{start}</span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="hidden sm:inline">{hint}</span>
        <RotateCcw aria-hidden className="size-3" />
      </span>
    </div>
  );
}
