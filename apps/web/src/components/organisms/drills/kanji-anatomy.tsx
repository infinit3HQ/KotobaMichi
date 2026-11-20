"use client";

import { Languages, Lightbulb, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import type { KanjiMasterItem } from "@/data/kanji-master";
import { speakJapanese } from "@/lib/audio";
import {
  kanjiMeaningText,
  lessonText,
  radicalMeaningText,
  sinhalaWordGloss,
} from "@/lib/i18n/content-si";
import { cn } from "@/lib/utils";
import { DrillSearch } from "./drill-ui";

type KanjiAnatomyProps = {
  pool: KanjiMasterItem[];
  filtered: KanjiMasterItem[];
  activeKanji: KanjiMasterItem | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectKanji: (id: string) => void;
  soundEnabled: boolean;
  speechRate: number;
  selectedLevel: JLPTLevel;
};

/** Kanji browser: a picker grid plus the selected character's parts, mnemonic and words. */
export function KanjiAnatomy({
  pool,
  filtered,
  activeKanji,
  searchQuery,
  setSearchQuery,
  onSelectKanji,
  soundEnabled,
  speechRate,
  selectedLevel,
}: KanjiAnatomyProps) {
  const playWordAudio = (text: string) => {
    if (!soundEnabled) return;
    speakJapanese(text, { rate: speechRate });
  };

  if (pool.length === 0) {
    return (
      <EmptyState
        icon={Languages}
        title="No kanji yet"
        description={`There are no ${selectedLevel} kanji in the curriculum.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DrillSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Kanji, meaning or reading"
          ariaLabel={`Search ${selectedLevel} kanji`}
        />
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {pool.length} kanji
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {activeKanji ? (
          <KanjiDetail kanji={activeKanji} onPlay={playWordAudio} />
        ) : null}

        <Card className="gap-3 p-4 sm:p-5 lg:col-span-5">
          <p className="text-sm text-muted-foreground">Tap a kanji to see its parts</p>
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching kanji"
              description="Try a different meaning, reading or character."
              action={
                <Button type="button" variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="grid max-h-[28rem] grid-cols-4 gap-2 overflow-y-auto p-0.5 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((k) => (
                <KanjiPickerButton
                  key={k.id}
                  kanji={k}
                  selected={activeKanji?.id === k.id}
                  onSelect={() => onSelectKanji(k.id)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function KanjiPickerButton({
  kanji,
  selected,
  onSelect,
}: {
  kanji: KanjiMasterItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const { locale } = useLocale();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "h-auto min-w-0 flex-col gap-0.5 px-1 py-2",
        selected && "border-primary bg-primary/10 hover:bg-primary/15"
      )}
    >
      <span className="font-jp text-2xl leading-tight font-semibold">{kanji.character}</span>
      <span className="w-full truncate text-[11px] text-muted-foreground">
        {kanjiMeaningText(locale, kanji).split(",")[0]}
      </span>
    </Button>
  );
}

function KanjiDetail({
  kanji,
  onPlay,
}: {
  kanji: KanjiMasterItem;
  onPlay: (text: string) => void;
}) {
  const { locale } = useLocale();

  return (
    <Card className="gap-5 p-4 sm:p-6 lg:col-span-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted font-jp text-4xl font-bold sm:size-20 sm:text-5xl">
            {kanji.character}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{kanji.level}</Badge>
              {kanji.dominantReading ? (
                <Badge variant="outline" className="font-jp">{kanji.dominantReading}</Badge>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold tracking-tight break-words">{kanjiMeaningText(locale, kanji)}</h3>
            <p className="text-xs text-muted-foreground">
              {kanji.radicals.length} {kanji.radicals.length === 1 ? "part" : "parts"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPlay(kanji.character)}
          aria-label="Listen to this kanji"
          className="shrink-0"
        >
          <Volume2 />
        </Button>
      </div>

      {kanji.radicals.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Parts <span className="font-jp font-normal text-muted-foreground">部首</span></p>
          <div className="flex flex-wrap gap-2">
            {kanji.radicals.map((rad, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
                <span className="font-jp text-lg font-semibold">{rad.character}</span>
                <span className="text-xs text-muted-foreground">{radicalMeaningText(locale, rad)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {kanji.mnemonic ? (
        <div className="space-y-1 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="flex items-center gap-1.5 font-medium">
            <Lightbulb className="size-4 text-muted-foreground" /> Memory hint
          </p>
          <p className="leading-relaxed text-muted-foreground">{lessonText(locale, kanji.mnemonic)}</p>
        </div>
      ) : null}

      {kanji.vocabulary.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Common words</p>
          <ul className="divide-y rounded-lg border">
            {kanji.vocabulary.map((vocab, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="font-jp">
                    <span className="text-base font-semibold">{vocab.word}</span>{" "}
                    <span className="text-xs text-muted-foreground">{vocab.reading}</span>
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {locale === "si"
                      ? (sinhalaWordGloss({
                          hiragana: vocab.reading,
                          kanji: vocab.word,
                          english: vocab.meaning,
                        }) ?? vocab.meaning)
                      : vocab.meaning}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onPlay(vocab.word)}
                  aria-label={`Listen to ${vocab.word}`}
                  className="shrink-0"
                >
                  <Volume2 />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
