"use client";

import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export type MondaiNavItem = { key: string; number: number; answered: number; total: number };

/** Jump between the 問題 of a section: a side list on wide screens, a scrolling row on phones. */
export function MondaiNav({
  items,
  current,
  onSelect,
  layout,
}: {
  items: readonly MondaiNavItem[];
  current: number;
  onSelect: (index: number) => void;
  layout: "side" | "row";
}) {
  if (layout === "row") {
    return (
      <nav aria-label="問題" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {items.map((item, index) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={index === current ? "default" : "outline"}
            aria-current={index === current ? "step" : undefined}
            className="font-jp shrink-0"
            onClick={() => onSelect(index)}
          >
            問題{item.number}
            <span className="font-mono text-xs tabular-nums opacity-70">
              {item.answered}/{item.total}
            </span>
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="問題" className="hidden w-40 shrink-0 flex-col gap-1 border-r border-border p-3 md:flex">
      {items.map((item, index) => (
        <Button
          key={item.key}
          type="button"
          variant="ghost"
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "h-auto justify-between py-2",
            index === current && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          )}
          onClick={() => onSelect(index)}
        >
          <span className="font-jp font-semibold">問題{item.number}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {item.answered}/{item.total}
          </span>
        </Button>
      ))}
    </nav>
  );
}
