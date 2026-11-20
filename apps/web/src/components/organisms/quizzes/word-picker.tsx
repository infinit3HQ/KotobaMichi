"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { useLocale } from "@/components/organisms/locale-provider";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { cn } from "@/lib/utils";
import type { Word } from "@/types/api";

type WordPickerProps = {
  words?: Word[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  selected: Record<string, boolean>;
  onToggle: (id: string) => void;
  /** Max height class for the scrolling list. */
  listClassName?: string;
};

function matches(word: Word, filter: string) {
  if (!filter) return true;
  const needle = filter.toLowerCase();
  return [word.kanji, word.hiragana, word.romaji, word.english].some((field) =>
    (field ?? "").toLowerCase().includes(needle)
  );
}

/** Filterable checkbox list of words, used when building a quiz. */
export function WordPicker({
  words,
  isLoading,
  isError,
  onRetry,
  selected,
  onToggle,
  listClassName = "max-h-80",
}: WordPickerProps) {
  const { t } = useLocale();
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => (words ?? []).filter((word) => matches(word, filter.trim())), [words, filter]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  if (isError) {
    return <QueryError title={t.quizzes.wordsLoadError} onRetry={onRetry} retryLabel={t.quizzes.retry} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t.quizzes.filterWords}
          aria-label={t.quizzes.filterWords}
          className="w-full sm:w-64"
        />
        <span className="text-sm text-muted-foreground tabular-nums">{t.quizzes.selectedCount(selectedCount)}</span>
      </div>
      <div className={cn("overflow-y-auto rounded-lg border border-border", listClassName)}>
        {isLoading ? (
          <div className="grid gap-1 p-2 sm:grid-cols-2" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full bg-muted" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">{t.quizzes.noWordsMatch}</p>
        ) : (
          <ul className="grid gap-x-2 p-1 sm:grid-cols-2">
            {visible.map((word) => (
              <li key={word.id}>
                <label className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox checked={!!selected[word.id]} onCheckedChange={() => onToggle(word.id)} />
                  <span className="min-w-0 break-words">
                    <span lang="ja" className="font-jp font-medium">
                      {word.kanji || word.hiragana || word.romaji}
                    </span>
                    <span className="text-muted-foreground"> · {word.english}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
