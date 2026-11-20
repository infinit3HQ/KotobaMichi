"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, SearchX } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { ALL_JLPT_KANJI_MASTER, type KanjiMasterItem } from "@/data/kanji-master";
import { CatalogResultBar, CatalogToolbar } from "./catalog-toolbar";
import { JLPT_LEVELS, SPEECH_RATES, formatNumber, type CatalogLevel, type CatalogView, type ColumnChoice, type SpeechRateKey } from "./catalog-types";
import { ColumnPicker, columnCount } from "./column-picker";
import { KANJI_CARD_HEIGHT, KanjiCard } from "./kanji-card";
import { KanjiTable } from "./kanji-table";
import { kanjiMatches } from "./kanji-utils";
import { useFlipState, useSlashToFocus } from "./use-catalog-ui";
import { VirtualCardGrid } from "./virtual-card-grid";
import { VoiceSpeedSelect } from "./voice-speed-select";

const LEVEL_COUNTS: Readonly<Record<CatalogLevel, number>> = {
  ALL: ALL_JLPT_KANJI_MASTER.length,
  ...(Object.fromEntries(
    JLPT_LEVELS.map((level) => [level, ALL_JLPT_KANJI_MASTER.filter((item) => item.level === level).length])
  ) as Record<Exclude<CatalogLevel, "ALL">, number>),
};

export function KanjiCatalog() {
  const { t } = useLocale();
  const copy = t.kanji;
  const [level, setLevel] = useState<CatalogLevel>("N5");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<CatalogView>("cards");
  const [columns, setColumns] = useState<ColumnChoice>("auto");
  const [rate, setRate] = useState<SpeechRateKey>("normal");
  const searchRef = useSlashToFocus();
  const flip = useFlipState();
  const speechRate = SPEECH_RATES[rate];

  const pool = useMemo(
    () => (level === "ALL" ? ALL_JLPT_KANJI_MASTER : ALL_JLPT_KANJI_MASTER.filter((item) => item.level === level)),
    [level]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? pool.filter((item) => kanjiMatches(item, query)) : pool;
  }, [pool, search]);

  const levelOptions = useMemo(
    () =>
      (["ALL", ...JLPT_LEVELS] as CatalogLevel[])
        .filter((value) => LEVEL_COUNTS[value] > 0)
        .map((value) => ({
          value,
          label: value === "ALL" ? copy.allLevels : value,
          meta: formatNumber(LEVEL_COUNTS[value]),
        })),
    [copy.allLevels]
  );

  const practiceLevel = level === "ALL" ? "N5" : level;
  const description =
    level === "ALL"
      ? copy.description(formatNumber(LEVEL_COUNTS.ALL))
      : copy.levelDescription(formatNumber(pool.length), level);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="漢字"
        title={copy.title}
        description={description}
        actions={
          <>
            <Button asChild>
              <Link href={`/practice?mode=kanji&level=${practiceLevel}`}>
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
          onLevelChange={setLevel}
          levelOptions={levelOptions}
          levelLabel={copy.levelLabel}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={copy.search}
          clearSearchLabel={copy.clearSearch}
          searchRef={searchRef}
          view={view}
          onViewChange={setView}
          viewLabels={{ label: copy.viewLabel, cards: copy.viewCards, list: copy.viewList }}
        />
        <CatalogResultBar
          count={copy.resultCount(formatNumber(filtered.length), formatNumber(pool.length))}
          actions={
            view === "cards" && filtered.length > 0 ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => flip.revealAll(filtered.map((item) => item.id))}>
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
            <Button variant="outline" onClick={() => setSearch("")}>
              {copy.clearSearchAction}
            </Button>
          }
        />
      ) : view === "cards" ? (
        <VirtualCardGrid<KanjiMasterItem>
          items={filtered}
          getKey={(item) => item.id}
          cardHeight={KANJI_CARD_HEIGHT}
          minCardWidth={150}
          maxColumns={6}
          columns={columnCount(columns)}
          renderItem={(item) => (
            <KanjiCard item={item} flipped={Boolean(flip.flipped[item.id])} onToggle={flip.toggle} speechRate={speechRate} />
          )}
        />
      ) : (
        <KanjiTable key={`${level}|${search}`} items={filtered} speechRate={speechRate} />
      )}
    </div>
  );
}
