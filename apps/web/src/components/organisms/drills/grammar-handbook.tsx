"use client";

import { useMemo, useState } from "react";
import { BookOpen, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import type { JLPTGrammarMasterItem } from "@/data/grammar-master";
import { speakJapanese } from "@/lib/audio";
import { GRAMMAR_SI, lessonText } from "@/lib/i18n/content-si";
import { DrillSearch } from "./drill-ui";

type GrammarHandbookProps = {
  pool: JLPTGrammarMasterItem[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

function matchesQuery(item: JLPTGrammarMasterItem, raw: string): boolean {
  const q = raw.toLowerCase().trim();
  const exact = raw.trim();
  return (
    item.point.toLowerCase().includes(q) ||
    item.meaning.toLowerCase().includes(q) ||
    Boolean(item.formation?.toLowerCase().includes(q)) ||
    item.exampleJapanese.toLowerCase().includes(q) ||
    Boolean(item.exampleRomaji?.toLowerCase().includes(q)) ||
    item.exampleEnglish.toLowerCase().includes(q) ||
    (GRAMMAR_SI[item.id]?.meaning ?? "").includes(exact) ||
    (GRAMMAR_SI[item.id]?.example ?? "").includes(exact)
  );
}

/** Searchable reference list of the level's grammar points with an example for each. */
export function GrammarHandbook({ pool, selectedLevel, soundEnabled, speechRate }: GrammarHandbookProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return pool;
    return pool.filter((item) => matchesQuery(item, searchQuery));
  }, [pool, searchQuery]);

  const handlePlayAudio = (item: JLPTGrammarMasterItem) => {
    if (!soundEnabled) return;
    setPlayingId(item.id);
    speakJapanese(item.exampleJapanese, {
      rate: speechRate,
      onEnd: () => setPlayingId(null),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DrillSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${selectedLevel} grammar`}
          ariaLabel={`Search ${selectedLevel} grammar points`}
        />
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} of {pool.length} points
        </p>
      </div>

      {pool.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No grammar points yet"
          description={`There are no ${selectedLevel} grammar points in the reference.`}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching grammar points"
          description="Try another pattern, meaning or Japanese word."
          action={
            <Button type="button" variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <GrammarPointCard
              key={item.id}
              item={item}
              isPlaying={playingId === item.id}
              onPlay={() => handlePlayAudio(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GrammarPointCard({
  item,
  isPlaying,
  onPlay,
}: {
  item: JLPTGrammarMasterItem;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const { locale } = useLocale();
  const copy = locale === "si" ? GRAMMAR_SI[item.id] : undefined;
  const meaning = copy?.meaning ?? lessonText(locale, item.meaning);
  const example = copy?.example ?? lessonText(locale, item.exampleEnglish);

  return (
    <Card className="gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.level}</Badge>
            <h3 className="font-jp text-lg font-semibold tracking-tight break-words">{item.point}</h3>
          </div>
          <p className="text-sm">{meaning}</p>
          {locale === "si" && meaning !== item.meaning ? (
            <p className="text-xs text-muted-foreground">{item.meaning}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant={isPlaying ? "secondary" : "outline"}
          size="icon"
          onClick={onPlay}
          aria-pressed={isPlaying}
          aria-label="Listen to the example sentence"
          className="shrink-0"
        >
          <Volume2 className={isPlaying ? "text-primary" : undefined} />
        </Button>
      </div>

      {item.formation ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm break-words">
          <span className="text-muted-foreground">Form: </span>
          <span className="font-mono text-xs">{item.formation}</span>
        </p>
      ) : null}

      <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-xs text-muted-foreground">Example</p>
        <p className="font-jp text-base leading-relaxed break-words">{item.exampleJapanese}</p>
        {item.exampleRomaji ? (
          <p className="font-mono text-xs text-muted-foreground break-words">{item.exampleRomaji}</p>
        ) : null}
        <p className="text-muted-foreground">{example}</p>
        {locale === "si" && example !== item.exampleEnglish ? (
          <p className="text-xs text-muted-foreground">{item.exampleEnglish}</p>
        ) : null}
      </div>
    </Card>
  );
}
