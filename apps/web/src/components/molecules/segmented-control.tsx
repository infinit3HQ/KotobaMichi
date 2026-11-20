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

/**
 * A single-choice switch built on shadcn's ToggleGroup. Always 36px tall (32px for "sm"),
 * so it lines up with inputs, selects and buttons in the same toolbar.
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
      className={cn(
        "gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        size === "sm" ? "h-8" : "h-9",
        fullWidth ? "w-full" : "w-fit",
        className
      )}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel}
          className={cn(
            "h-full gap-1.5 rounded-md! border-0 px-3 text-sm font-medium text-muted-foreground shadow-none",
            "hover:bg-transparent hover:text-foreground",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs",
            fullWidth ? "flex-1" : "flex-none"
          )}
        >
          {option.label}
          {option.meta != null ? (
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{option.meta}</span>
          ) : null}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
