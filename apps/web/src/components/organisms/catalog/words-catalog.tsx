"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, SearchX } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import type { VocabCatalog } from "@/hooks/use-vocab-catalog";
import { CatalogResultBar, CatalogToolbar } from "./catalog-toolbar";
import { JLPT_LEVELS, SPEECH_RATES, formatNumber, type CatalogLevel, type CatalogView, type ColumnChoice, type SpeechRateKey } from "./catalog-types";
import { ColumnPicker, columnCount } from "./column-picker";
import { TopicSelect } from "./topic-select";
import { useFlipState, useSlashToFocus } from "./use-catalog-ui";
import { useWordCatalog } from "./use-word-catalog";
import { VirtualCardGrid } from "./virtual-card-grid";
import { VoiceSpeedSelect } from "./voice-speed-select";
import { WORD_CARD_HEIGHT, WordCard } from "./word-card";
import { WordTable } from "./word-table";
import { ALL_TOPICS, type CatalogWord } from "./word-types";

type WordsCatalogProps = {
  vocab: VocabCatalog;
};

export function WordsCatalog({ vocab }: WordsCatalogProps) {
  const { t } = useLocale();
  const copy = t.words;
  const [level, setLevel] = useState<CatalogLevel>("ALL");
  const [topic, setTopic] = useState(ALL_TOPICS);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<CatalogView>("cards");
  const [columns, setColumns] = useState<ColumnChoice>("auto");
  const [rate, setRate] = useState<SpeechRateKey>("normal");
  const searchRef = useSlashToFocus();
  const flip = useFlipState();
  const { words, filtered, levelCounts, topics, topicCounts } = useWordCatalog(vocab, level, topic, search);
  const speechRate = SPEECH_RATES[rate];

  const levelOptions = useMemo(
    () =>
      (["ALL", ...JLPT_LEVELS] as CatalogLevel[]).map((value) => ({
        value,
        label: value === "ALL" ? copy.allLevels : value,
        meta: formatNumber(levelCounts[value]),
      })),
    [copy.allLevels, levelCounts]
  );

  const changeLevel = (next: CatalogLevel) => {
    setLevel(next);
    setTopic(ALL_TOPICS);
  };
  const clearFilters = () => {
    setSearch("");
    setTopic(ALL_TOPICS);
  };

  const description =
    level === "ALL"
      ? copy.description(formatNumber(levelCounts.ALL))
      : copy.levelDescription(formatNumber(words.length), level);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="語彙"
        title={copy.title}
        description={description}
        actions={
          <>
            <Button asChild>
              <Link href="/practice">
                {copy.practice}
                <ArrowRight />
              </Link>
            </Button>
            <VoiceSpeedSelect value={rate} onValueChange={setRate} label={copy.voiceLabel} formatOption={copy.voice} />
          </>
        }
      />

      <div className="space-y-3">
        <CatalogToolbar
          level={level}
          onLevelChange={changeLevel}
          levelOptions={levelOptions}
          levelLabel={copy.levelLabel}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={copy.search}
          clearSearchLabel={copy.clearSearch}
          searchRef={searchRef}
          filters={
            <TopicSelect
              value={topic}
              onValueChange={setTopic}
              topics={topics}
              counts={topicCounts}
              label={copy.topicLabel}
              allLabel={copy.allTopics}
            />
          }
          view={view}
          onViewChange={setView}
          viewLabels={{ label: copy.viewLabel, cards: copy.viewCards, list: copy.viewList }}
        />
        <CatalogResultBar
          count={copy.resultCount(formatNumber(filtered.length), formatNumber(words.length))}
          actions={
            view === "cards" && filtered.length > 0 ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => flip.revealAll(filtered.map((word) => word.id))}>
                  <Eye />
                  {copy.revealAll}
                </Button>
                <Button variant="ghost" size="sm" onClick={flip.reset}>
                  <EyeOff />
                  {copy.hideAll}
                </Button>
              </>
            ) : null
          }
          columns={
            view === "cards" ? (
              <ColumnPicker value={columns} onValueChange={setColumns} label={copy.columnsLabel} autoLabel={copy.columnsAuto} />
            ) : null
          }
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={copy.emptyTitle}
          description={copy.emptyDesc}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {copy.clearFilters}
            </Button>
          }
        />
      ) : view === "cards" ? (
        <VirtualCardGrid<CatalogWord>
          items={filtered}
          getKey={(word) => word.id}
          cardHeight={WORD_CARD_HEIGHT}
          minCardWidth={220}
          maxColumns={5}
          columns={columnCount(columns)}
          renderItem={(word) => (
            <WordCard word={word} flipped={Boolean(flip.flipped[word.id])} onToggle={flip.toggle} speechRate={speechRate} />
          )}
        />
      ) : (
        <WordTable key={`${level}|${topic}|${search}`} items={filtered} speechRate={speechRate} />
      )}
    </div>
  );
}
