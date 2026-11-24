"use client";

import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/atoms/toggle-group";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Optional count or hint shown after the label. */
  meta?: ReactNode;
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  ariaLabel: string;
  /** Stretch to the full width (good on phones). */
  fullWidth?: boolean;
  size?: "sm" | "default";
  className?: string;
};

function SegmentFace<T extends string>({
  option,
  options,
}: {
  option: SegmentOption<T>;
  options: readonly SegmentOption<T>[];
}) {
  return (
    <span className="grid">
      {options.map((peer) => {
        const hidden = peer.value !== option.value;
        return (
          <span
            key={peer.value}
            aria-hidden={hidden || undefined}
            className={cn(
              "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
              hidden && "invisible"
            )}
          >
            {peer.label}
            {peer.meta != null ? (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{peer.meta}</span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

/**
 * A single-choice switch built on shadcn's ToggleGroup. Always 36px tall (32px for "sm"),
 * so it lines up with inputs, selects and buttons in the same toolbar.
 *
 * Every option is the same width and the same type size. The selected background fills
 * that segment, inset evenly from the track.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  fullWidth = false,
  size = "default",
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      aria-label={ariaLabel}
      style={
        options.length > 0
          ? { gridTemplateColumns: `repeat(${options.length}, minmax(max-content, 1fr))` }
          : undefined
      }
      className={cn(
        "grid items-stretch gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        size === "sm" ? "h-8" : "h-9",
        fullWidth ? "w-full" : "w-max",
        className
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel}
          className={cn(
            "h-auto min-h-0 w-auto min-w-max flex-none basis-auto self-stretch justify-center rounded-md! border-0 px-3 text-sm font-medium text-muted-foreground shadow-none",
            "hover:bg-transparent hover:text-foreground",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
          )}
        >
          <SegmentFace option={option} options={options} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
