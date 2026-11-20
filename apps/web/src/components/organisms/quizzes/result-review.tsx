"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { useLocale } from "@/components/organisms/locale-provider";
import { lessonText, sinhalaWordGloss } from "@/lib/i18n/content-si";
import { cn } from "@/lib/utils";
import type { SubmitQuizResponse, SubmitResultItem } from "@/types/api";

/** Score card at the top of the results page. */
export function ResultSummaryCard({ result }: { result: SubmitQuizResponse }) {
  const { t } = useLocale();
  const total = result.results.length || result.totalQuestions;
  const correct = result.results.filter((item) => item.isCorrect).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">{percent}%</p>
          <p className="text-sm text-muted-foreground tabular-nums">{t.quizzes.correctCount(correct, total)}</p>
        </div>
        <Progress value={percent} aria-label={`${percent}%`} />
      </CardContent>
    </Card>
  );
}

function ResultRow({ item }: { item: SubmitResultItem }) {
  const { t, locale } = useLocale();
  const headword = item.word.kanji || item.word.hiragana || item.word.romaji;
  const meaning =
    locale === "si" ? (sinhalaWordGloss(item.word) ?? lessonText(locale, item.word.english)) : item.word.english;

  return (
    <li className="flex items-start gap-3 p-4 sm:px-6">
      {item.isCorrect ? (
        <CheckCircle2 className="mt-1 size-5 shrink-0 text-chart-3" aria-label={t.quizzes.correct} />
      ) : (
        <XCircle className="mt-1 size-5 shrink-0 text-destructive" aria-label={t.quizzes.incorrect} />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span lang="ja" className="font-jp text-lg font-semibold break-words">
            {headword}
          </span>
          {item.word.kanji && item.word.hiragana ? (
            <span lang="ja" className="font-jp text-sm text-muted-foreground">
              {item.word.hiragana}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground break-words">{meaning}</p>
        <p className="text-sm break-words">
          <span className="text-muted-foreground">{t.quizzes.yourAnswer}: </span>
          <span className={cn("font-medium", item.isCorrect ? "text-chart-3" : "text-destructive")}>
            {item.userAnswer || t.quizzes.noAnswer}
          </span>
        </p>
        {!item.isCorrect ? (
          <p className="text-sm break-words">
            <span className="text-muted-foreground">{t.quizzes.correctAnswer}: </span>
            <span className="font-medium">{item.correctAnswers.join(", ")}</span>
          </p>
        ) : null}
      </div>
      <Badge
        variant="outline"
        className={cn(
          "hidden shrink-0 sm:inline-flex",
          item.isCorrect ? "border-chart-3/30 bg-chart-3/10 text-chart-3" : "border-destructive/30 bg-destructive/10 text-destructive"
        )}
      >
        {item.isCorrect ? t.quizzes.correct : t.quizzes.incorrect}
      </Badge>
    </li>
  );
}

/** Per-question review list. */
export function ResultReviewList({ items }: { items: SubmitResultItem[] }) {
  return (
    <Card className="gap-0 py-0">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <ResultRow key={item.wordId} item={item} />
        ))}
      </ul>
    </Card>
  );
}
