"use client";

import { Card } from "@/components/atoms/card";
import { SectionHeading } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { cn } from "@/lib/utils";
import { DRILL_ICONS, DRILL_IDS, type PracticeMode } from "./drills";

/** Grid of the practice drills. One is always selected; the drill itself renders below the grid. */
export function DrillPicker({
  value,
  onSelect,
}: {
  value: PracticeMode;
  onSelect: (mode: PracticeMode) => void;
}) {
  const { t } = useLocale();

  return (
    <section className="space-y-3" aria-labelledby="drill-picker-heading">
      <SectionHeading title={<span id="drill-picker-heading">{t.practice.drillsTitle}</span>} meta={t.practice.drillCount(DRILL_IDS.length)} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {DRILL_IDS.map((id) => {
          const Icon = DRILL_ICONS[id];
          const drill = t.practice.drills[id];
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(id)}
              className="group rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Card
                className={cn(
                  "h-full gap-3 p-4 transition-colors",
                  selected ? "border-primary ring-1 ring-primary/30" : "group-hover:border-primary/40"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm font-semibold tracking-tight sm:text-base">{drill.title}</h3>
                  <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{drill.subtitle}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
