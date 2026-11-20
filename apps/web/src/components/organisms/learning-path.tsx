"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { useLocale } from "@/components/organisms/locale-provider";
import { useLearning } from "@/hooks/use-learning";
import { WORD_TOTALS } from "@/lib/learning";
import type { JLPTLevel } from "@/data/grammar";

const MODE_LABEL: Record<string, string> = {
  sprint: "Speed Sprint",
  grammar: "Grammar Lab",
  kanji: "Kanji Dojo",
  listening: "Listening",
  reading: "Reading",
  flashcard: "Flashcards",
  kana: "Kana Board",
};

export function LearningPath({
  compact = false,
  onContinue,
}: {
  compact?: boolean;
  onContinue?: (level: JLPTLevel, mode: string) => void;
}) {
  const { t } = useLocale();
  const { user, summary } = useLearning();

  if (!user) {
    if (compact) return null;
    return (
      <div className="rounded-2xl border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
        {t.path.signIn}{" "}
        <Link href="/auth/login" className="font-semibold text-primary underline">
          {t.nav.signIn}
        </Link>
      </div>
    );
  }

  if (!summary) {
    return <div className="h-24 rounded-2xl border bg-card/50 animate-pulse" />;
  }

  const place = summary.place;
  const continueHref = place
    ? `/practice?level=${place.level}&mode=${place.mode}`
    : "/practice?level=N5&mode=flashcard";

  return (
    <section className="rounded-2xl border bg-card/70 p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.path.title}
          </p>
          <p className="mt-1 text-sm font-medium">
            {t.path.streak(summary.streak)}
            <span className="mx-2 text-muted-foreground">·</span>
            {t.path.studied(summary.studiedToday)}
            <span className="mx-2 text-muted-foreground">·</span>
            {t.path.due(summary.dueNow)}
          </p>
        </div>
        {onContinue ? (
          <Button
            size="sm"
            onClick={() =>
              onContinue(
                (place?.level as JLPTLevel) || "N5",
                place?.mode || "flashcard"
              )
            }
          >
            {t.path.continue}
            {place ? ` ${place.level} ${MODE_LABEL[place.mode] ?? ""}` : " N5"}
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={continueHref}>
              {t.path.continue}
              {place ? ` ${place.level}` : " N5"}
            </Link>
          </Button>
        )}
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {summary.levels.map((row) => {
          const total = WORD_TOTALS[row.level] ?? 1;
          const percent = Math.min(100, Math.round((row.learned / total) * 100));
          return (
            <div key={row.level} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-bold">{row.level}</span>
                <span className="text-muted-foreground">
                  {t.path.learned(row.learned, total)}
                </span>
              </div>
              <Progress value={percent} />
              {!compact && row.due > 0 ? (
                <p className="text-[11px] text-muted-foreground">{t.path.due(row.due)}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      {!compact ? (
        <p className="mt-3 text-[11px] text-muted-foreground">{t.path.newWords}</p>
      ) : null}
    </section>
  );
}
