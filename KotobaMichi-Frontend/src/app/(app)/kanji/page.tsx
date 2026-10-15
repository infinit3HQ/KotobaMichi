"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Eye, LayoutGrid, RotateCcw, Search, Table as TableIcon, Volume2, X, Zap } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useLocale } from "@/components/organisms/locale-provider";
import { ALL_JLPT_KANJI_MASTER, type KanjiMasterItem } from "@/data/kanji-master";
import type { JLPTLevel } from "@/data/grammar";
import { kanjiMeaningText } from "@/lib/i18n/content-si";
import { speakJapanese } from "@/lib/audio";

type KanjiFilterLevel = "ALL" | JLPTLevel;

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
const LEVEL_MARK: Record<KanjiFilterLevel, string> = {
  ALL: "全",
  N5: "五",
  N4: "四",
  N3: "三",
  N2: "二",
  N1: "一",
};

function readingsOf(item: KanjiMasterItem) {
  const on = (item.onYomi ?? []).map((value) => value.trim()).filter(Boolean);
  const kun = (item.kunYomi ?? []).map((value) => value.trim()).filter(Boolean);
  const dominant = item.dominantReading?.trim() ?? "";
  return { on, kun, dominant };
}

export default function KanjiPage() {
  const { t } = useLocale();
  const [selectedLevel, setSelectedLevel] = useState<KanjiFilterLevel>("N5");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"flashcards" | "table">("flashcards");
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [speechRate, setSpeechRate] = useState(0.92);
  const [gridColumns, setGridColumns] = useState<number | "auto">("auto");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const next: Record<KanjiFilterLevel, number> = { ALL: ALL_JLPT_KANJI_MASTER.length, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
    ALL_JLPT_KANJI_MASTER.forEach((item) => {
      next[item.level] += 1;
    });
    return next;
  }, []);

  const pool = useMemo(() => {
    if (selectedLevel === "ALL") return ALL_JLPT_KANJI_MASTER;
    return ALL_JLPT_KANJI_MASTER.filter((item) => item.level === selectedLevel);
  }, [selectedLevel]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pool;
    return pool.filter((item) => {
      const { on, kun, dominant } = readingsOf(item);
      return (
        item.character.includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.level.toLowerCase().includes(query) ||
        dominant.toLowerCase().includes(query) ||
        on.some((reading) => reading.toLowerCase().includes(query)) ||
        kun.some((reading) => reading.toLowerCase().includes(query)) ||
        item.radicals.some(
          (radical) => radical.character.includes(query) || radical.meaning.toLowerCase().includes(query)
        ) ||
        item.vocabulary.some(
          (word) =>
            word.word.includes(query) ||
            word.reading.toLowerCase().includes(query) ||
            word.meaning.toLowerCase().includes(query)
        )
      );
    });
  }, [pool, search]);

  const toggleCard = useCallback((id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const flipAllCards = useCallback(() => {
    const next: Record<string, boolean> = {};
    filtered.forEach((item) => {
      next[item.id] = true;
    });
    setFlippedMap(next);
  }, [filtered]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const practiceLevel = selectedLevel === "ALL" ? "N5" : selectedLevel;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-2 pb-12 sm:px-4">
      <div className="bg-zen-radial relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm backdrop-blur-md sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {selectedLevel === "ALL" ? t.kanji.vaultAll : t.kanji.vaultLevel(selectedLevel)}
              </span>
              <span className="font-jp text-xs font-medium text-muted-foreground">漢字道 · 漢字帳</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {t.kanji.title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {selectedLevel === "ALL"
                ? t.kanji.allDesc
                : t.kanji.levelDesc(pool.length.toLocaleString(), selectedLevel)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button asChild className="gap-2 bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <Link href={`/practice?mode=kanji&level=${practiceLevel}`}>
                <Zap className="h-4 w-4 fill-current text-amber-300" />
                {t.kanji.practice}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpeechRate(speechRate === 0.92 ? 0.72 : 0.92)}
              className="h-9 gap-1.5 border-border/80 bg-background/50 text-xs hover:bg-secondary"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>{t.kanji.voice(speechRate === 0.92 ? "1.0x" : "0.75x")}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card/90 p-4 shadow-xs backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t.kanji.level}:
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 p-1">
              {(["ALL", ...LEVELS] as KanjiFilterLevel[])
                .filter((level) => counts[level] > 0)
                .map((level) => {
                const active = selectedLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(level)}
                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      active
                        ? "scale-102 bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="font-jp text-[11px] font-bold opacity-80">{LEVEL_MARK[level]}</span>
                    <span>{level === "ALL" ? "All" : level}</span>
                    <span
                      className={`rounded-full px-1.5 font-mono text-[10px] ${
                        active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {counts[level].toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              ref={searchInputRef}
              placeholder={t.kanji.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-lg border-border/80 bg-background/60 pr-9 pl-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs sm:justify-end">
            <Badge variant="secondary" className="h-11 shrink-0 rounded-lg px-3 font-mono font-medium">
              {filtered.length} / {pool.length} kanji
            </Badge>
            <div className="flex h-11 shrink-0 items-center rounded-lg border border-border/70 bg-background/50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("flashcards")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "flashcards" ? "bg-secondary font-semibold text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "table" ? "bg-secondary font-semibold text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === "flashcards" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={flipAllCards}
                className="h-7 gap-1 border-border/80 bg-background/50 px-2.5 text-xs hover:bg-secondary"
              >
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span>Reveal all meanings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFlippedMap({})}
                className="h-7 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to kanji</span>
              </Button>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-[11px] font-medium">Columns:</span>
              {(["auto", 1, 2, 3, 4, 5] as const).map((column) => (
                <button
                  key={column}
                  type="button"
                  onClick={() => setGridColumns(column)}
                  className={`h-6 rounded px-2 font-mono text-[11px] transition-all ${
                    gridColumns === column
                      ? "bg-primary/15 font-bold text-primary ring-1 ring-primary/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {column === "auto" ? "Auto" : column}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="my-8 flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Search className="h-6 w-6 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No kanji matches</h3>
            <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
              Nothing in this level matches that search.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setSearch("")} className="text-xs">
            Clear search
          </Button>
        </div>
      ) : viewMode === "flashcards" ? (
        <KanjiCardGrid
          items={filtered}
          flippedMap={flippedMap}
          onToggleCard={toggleCard}
          columns={gridColumns === "auto" ? undefined : gridColumns}
          speechRate={speechRate}
        />
      ) : (
        <KanjiTable items={filtered} speechRate={speechRate} />
      )}
    </div>
  );
}

function KanjiFlashcard({
  item,
  flipped,
  onToggle,
  speechRate,
}: {
  item: KanjiMasterItem;
  flipped: boolean;
  onToggle: () => void;
  speechRate: number;
}) {
  const { locale } = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);
  const { on, kun, dominant } = readingsOf(item);
  const meaning = kanjiMeaningText(locale, item);
  const examples = item.vocabulary.slice(0, 2);

  const playAudio = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isPlaying) return;
      setIsPlaying(true);
      await speakJapanese(item.character, {
        rate: speechRate,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
      setIsPlaying(false);
    },
    [isPlaying, item.character, speechRate]
  );

  return (
    <div
      className="group perspective h-64 cursor-pointer select-none"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      aria-label={`Kanji ${item.character}, meaning ${item.meaning}`}
    >
      <div className={`preserve-3d relative h-full w-full rounded-2xl transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
        <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wider text-secondary-foreground uppercase">
              {item.level}
            </span>
            <button
              type="button"
              onClick={playAudio}
              disabled={isPlaying}
              className={`rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary ${isPlaying ? "animate-pulse bg-primary/10 text-primary" : ""}`}
              aria-label="Play pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="my-auto text-center">
            <span className="font-jp block text-6xl font-black tracking-tight text-foreground">{item.character}</span>
            {dominant && <span className="font-jp mt-1 block text-sm text-primary/85">{dominant}</span>}
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground/70">
            <span className="font-jp text-[10px]">漢字</span>
            <span className="flex items-center gap-1 transition-colors group-hover:text-foreground">
              Tap to reveal
              <RotateCcw className="h-2.5 w-2.5 opacity-60 transition-transform duration-500 group-hover:rotate-180" />
            </span>
          </div>
        </div>

        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-2xl border border-primary/30 bg-card bg-gradient-to-b from-primary/5 via-card to-card p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {item.level}
            </span>
            <button
              type="button"
              onClick={playAudio}
              disabled={isPlaying}
              className={`rounded-full p-1.5 text-primary transition-colors hover:bg-primary/10 ${isPlaying ? "animate-pulse" : ""}`}
              aria-label="Play pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="my-auto space-y-1.5 px-1 text-center">
            <h4 className="text-lg leading-snug font-extrabold tracking-tight text-foreground">{meaning}</h4>
            {(on.length > 0 || kun.length > 0 || dominant) && (
              <p className="font-jp text-xs text-muted-foreground">
                {on.length > 0 && <span>音 {on.join("・")}</span>}
                {on.length > 0 && kun.length > 0 && <span className="mx-1 opacity-40">·</span>}
                {kun.length > 0 && <span>訓 {kun.join("・")}</span>}
                {on.length === 0 && kun.length === 0 && dominant && <span>{dominant}</span>}
              </p>
            )}
            {item.radicals.length > 0 && (
              <p className="truncate text-[11px] text-muted-foreground">
                {item.radicals
                  .slice(0, 4)
                  .map((radical) => `${radical.character} ${radical.meaning}`)
                  .join(" · ")}
              </p>
            )}
            {examples.length > 0 && (
              <p className="font-jp truncate text-xs text-foreground/80">
                {examples.map((word) => `${word.word} ${word.reading}`).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end border-t border-border/40 pt-2 text-[11px] text-primary/80">
            <span className="flex items-center gap-1">
              Flip back
              <RotateCcw className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanjiCardGrid({
  items,
  flippedMap,
  onToggleCard,
  columns: forceColumns,
  speechRate,
}: {
  items: KanjiMasterItem[];
  flippedMap: Record<string, boolean>;
  onToggleCard: (id: string) => void;
  columns?: number;
  speechRate: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  const columns =
    forceColumns ??
    (parentWidth < 640 ? 1 : parentWidth < 860 ? 2 : parentWidth < 1140 ? 3 : parentWidth < 1400 ? 4 : 5);
  const itemHeight = 272;
  const totalRows = Math.ceil(items.length / columns);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const updateMeasurements = () => {
      setParentWidth(parent.clientWidth);
      setScrollMargin(parent.offsetTop);
    };
    updateMeasurements();
    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, []);

  const rowVirtualizer = useWindowVirtualizer({
    count: totalRows,
    estimateSize: () => itemHeight,
    overscan: 4,
    scrollMargin,
  });

  return (
    <div ref={parentRef} className="w-full">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowItems = items.slice(start, start + columns);
          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              <div className="grid h-full gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {rowItems.map((item) => (
                  <KanjiFlashcard
                    key={item.id}
                    item={item}
                    flipped={!!flippedMap[item.id]}
                    onToggle={() => onToggleCard(item.id)}
                    speechRate={speechRate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanjiTable({ items, speechRate }: { items: KanjiMasterItem[]; speechRate: number }) {
  const { locale } = useLocale();
  const [page, setPage] = useState(1);
  const pageSize = 40;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const rows = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/80 bg-secondary/60 text-[11px] font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="w-16 px-4 py-3">Level</th>
              <th className="px-4 py-3">Kanji</th>
              <th className="px-4 py-3">Meaning</th>
              <th className="hidden px-4 py-3 sm:table-cell">Reading</th>
              <th className="hidden px-4 py-3 md:table-cell">Example</th>
              <th className="px-4 py-3 text-right">Listen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((item) => (
              <KanjiTableRow key={item.id} item={item} locale={locale} speechRate={speechRate} />
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/50 px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function KanjiTableRow({
  item,
  locale,
  speechRate,
}: {
  item: KanjiMasterItem;
  locale: string;
  speechRate: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { dominant, on, kun } = readingsOf(item);
  const reading = dominant || [...on, ...kun].join("・");
  const example = item.vocabulary[0];

  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-4 py-3">
        <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
          {item.level}
        </span>
      </td>
      <td className="font-jp px-4 py-3 text-2xl font-bold text-foreground">{item.character}</td>
      <td className="px-4 py-3 font-medium text-foreground">{kanjiMeaningText(locale, item)}</td>
      <td className="font-jp hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{reading || "—"}</td>
      <td className="font-jp hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
        {example ? `${example.word} · ${example.meaning}` : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={async () => {
            if (isPlaying) return;
            setIsPlaying(true);
            await speakJapanese(item.character, {
              rate: speechRate,
              onEnd: () => setIsPlaying(false),
              onError: () => setIsPlaying(false),
            });
            setIsPlaying(false);
          }}
          className={`rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary ${isPlaying ? "animate-pulse text-primary" : ""}`}
          aria-label="Listen"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
