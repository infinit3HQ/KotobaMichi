"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { api } from "@/lib/api";
import type { WordsListResponse, Word } from "@/types/api";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/atoms/select";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Volume2,
  Search,
  Zap,
  RotateCcw,
  ListFilter,
  X,
  Eye,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import Link from "next/link";
import { speakJapanese } from "@/lib/audio";
import { JLPT_N5_WORDS, JLPT_TOPICS, type JLPTWord } from "@/data/vocab-n5";

interface EnrichedWord extends Word {
  topic?: string;
  partOfSpeech?: string;
}

export default function WordsPage() {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [gridColumns, setGridColumns] = useState<number | "auto">("auto");
  const [viewMode, setViewMode] = useState<"flashcards" | "table">("flashcards");
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const limit = 1000;

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["words", { limit }],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<WordsListResponse>("/words", {
        params: { page: pageParam, limit },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    retry: 1,
  });

  // Map fallback word metadata (topic, partOfSpeech)
  const vocabMetaMap = useMemo(() => {
    const map = new Map<string, JLPTWord>();
    JLPT_N5_WORDS.forEach((w) => {
      map.set(w.id, w);
      if (w.hiragana) map.set(w.hiragana, w);
    });
    return map;
  }, []);

  const fallbackWords: EnrichedWord[] = useMemo(() => {
    return JLPT_N5_WORDS.map((w) => ({
      id: w.id,
      kanji: w.kanji,
      hiragana: w.hiragana,
      romaji: w.romaji,
      english: w.english,
      level: w.level,
      topic: w.topic,
      partOfSpeech: w.partOfSpeech,
      pronunciationUrl: "",
      createdAt: new Date().toISOString(),
    }));
  }, []);

  const words: EnrichedWord[] = useMemo(() => {
    const fetched = (data?.pages ?? []).flatMap((p) => p.words);
    const source = fetched.length > 0 ? fetched : fallbackWords;
    return source.map((w) => {
      const meta = vocabMetaMap.get(w.id) || vocabMetaMap.get(w.hiragana);
      return {
        ...w,
        topic: meta?.topic ?? (w as EnrichedWord).topic ?? "General",
        partOfSpeech: meta?.partOfSpeech ?? (w as EnrichedWord).partOfSpeech ?? "Vocabulary",
      };
    });
  }, [data?.pages, fallbackWords, vocabMetaMap]);

  // Topic counts for filter chips
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { All: words.length };
    words.forEach((w) => {
      const t = w.topic || "General";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [words]);

  // Filtered words
  const filtered = useMemo(() => {
    let list = words;
    if (selectedTopic !== "All") {
      list = list.filter((w) => w.topic === selectedTopic);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((w) =>
        [w.english, w.hiragana, w.romaji, w.kanji ?? "", w.level ?? "", w.topic ?? ""].some(
          (v) => v?.toLowerCase().includes(q)
        )
      );
    }
    return list;
  }, [words, selectedTopic, search]);

  const toggleCard = useCallback((id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const flipAllCards = useCallback(() => {
    const next: Record<string, boolean> = {};
    filtered.forEach((w) => {
      next[w.id] = true;
    });
    setFlippedMap(next);
  }, [filtered]);

  const resetAllCards = useCallback(() => {
    setFlippedMap({});
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading && words.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md shadow-sm bg-zen-radial">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded bg-primary/10 text-primary border border-primary/25">
                JLPT N5
              </span>
              <span className="font-jp text-xs text-muted-foreground font-medium">
                言葉道 · 語彙探索
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Vocabulary Explorer
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Master 560+ core Japanese words through tactile 3D flashcards, native audio pronunciation, and topic-based immersion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              asChild
              className="gap-2 font-semibold shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/practice">
                <Zap className="h-4 w-4 fill-current text-amber-300" />
                Practice Dojo
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpeechRate(speechRate === 0.92 ? 0.72 : 0.92)}
              className="text-xs h-9 gap-1.5 border-border/80 bg-background/50 hover:bg-secondary"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span>Voice: {speechRate === 0.92 ? "1.0x" : "0.75x"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Controls & Search Command Deck */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card/90 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              ref={searchInputRef}
              placeholder="Search by English, Hiragana, Kanji, or Romaji... (Press '/' to focus)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-9 h-11 text-sm bg-background/60 border-border/80 rounded-lg focus-visible:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Topic Filter Dropdown (shadcn Select) */}
          <div className="w-full sm:w-auto min-w-[210px]">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="h-11 w-full bg-background/60 border-border/80 rounded-lg text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2 truncate">
                  <ListFilter className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {selectedTopic === "All" ? "All Topics" : selectedTopic} ({topicCounts[selectedTopic] || 0})
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="All">
                  All Topics ({topicCounts["All"] || 0})
                </SelectItem>
                {JLPT_TOPICS.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic} ({topicCounts[topic] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Count & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <Badge variant="secondary" className="h-11 px-3 font-mono font-medium rounded-lg shrink-0">
              {filtered.length} / {words.length} words
            </Badge>

            {/* View Switcher */}
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-background/50 h-11 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("flashcards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "flashcards"
                    ? "bg-secondary text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="3D Flashcards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-secondary text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dense List View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedTopic !== "All" || search.trim() !== "") && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-border/40">
            <span className="text-muted-foreground text-[11px] font-medium">Active filters:</span>
            {selectedTopic !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                Topic: {selectedTopic}
                <button
                  type="button"
                  onClick={() => setSelectedTopic("All")}
                  className="hover:opacity-75 p-0.5 rounded-full cursor-pointer"
                  aria-label="Clear topic filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {search.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                Search: &ldquo;{search}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:opacity-75 p-0.5 rounded-full cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedTopic("All");
                setSearch("");
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Study Toolbar: Grid Density & Card Actions */}
        {viewMode === "flashcards" && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
            {/* Flip All / Reset */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={flipAllCards}
                className="h-7 px-2.5 text-xs gap-1 border-border/80 bg-background/50 hover:bg-secondary"
              >
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span>Reveal All English</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllCards}
                className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Japanese</span>
              </Button>
            </div>

            {/* Column selector */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-[11px] font-medium">Columns:</span>
              {(["auto", 1, 2, 3, 4, 5] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setGridColumns(col)}
                  className={`h-6 px-2 text-[11px] font-mono rounded transition-all ${
                    gridColumns === col
                      ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                      : "hover:bg-secondary hover:text-foreground text-muted-foreground"
                  }`}
                >
                  {col === "auto" ? "Auto" : col}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Flashcards Grid or Compact Table */}
      {filtered.length === 0 ? (
        <EmptyState onReset={() => { setSearch(""); setSelectedTopic("All"); }} />
      ) : viewMode === "flashcards" ? (
        <VirtualizedCardsGrid
          items={filtered}
          flippedMap={flippedMap}
          onToggleCard={toggleCard}
          onLoadMore={loadMore}
          isLoading={isFetchingNextPage}
          columns={gridColumns === "auto" ? undefined : gridColumns}
          speechRate={speechRate}
        />
      ) : (
        <CompactTableView
          items={filtered}
          speechRate={speechRate}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <span className="font-jp text-2xl font-black animate-pulse">道</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Loading vocabulary vault...
      </p>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 my-8 space-y-4">
      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
        <Search className="h-6 w-6 opacity-60" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">No vocabulary matches</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
          No words found matching your active filter and search terms.
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={onReset} className="text-xs">
        Clear filters & show all
      </Button>
    </div>
  );
}

/* 3D Flashcard Component */
function ModernFlashcard({
  word,
  flipped,
  onToggle,
  speechRate,
}: {
  word: EnrichedWord;
  flipped: boolean;
  onToggle: () => void;
  speechRate: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) return;
      setIsPlaying(true);
      await speakJapanese(word.kanji || word.hiragana, {
        rate: speechRate,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
      setIsPlaying(false);
    },
    [word.kanji, word.hiragana, speechRate, isPlaying]
  );

  return (
    <div
      className="group perspective cursor-pointer h-52 select-none"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-label={`Flashcard: ${word.kanji || word.hiragana}, English: ${word.english}`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 preserve-3d rounded-2xl ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side (Japanese) */}
        <div className="absolute inset-0 backface-hidden rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {word.topic || "General"}
            </span>

            <button
              type="button"
              onClick={playAudio}
              disabled={isPlaying}
              className={`p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${
                isPlaying ? "text-primary bg-primary/10 animate-pulse" : ""
              }`}
              title="Listen pronunciation"
              aria-label="Play native audio"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Japanese Center Typography */}
          <div className="text-center my-auto py-1">
            {word.kanji && word.kanji !== word.hiragana ? (
              <div className="space-y-0.5">
                <span className="font-jp text-xs text-primary/85 font-medium tracking-wide block">
                  {word.hiragana}
                </span>
                <span className="font-jp text-3xl font-extrabold text-foreground tracking-tight block">
                  {word.kanji}
                </span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="font-jp text-3xl font-extrabold text-foreground tracking-tight block">
                  {word.hiragana}
                </span>
              </div>
            )}

            {word.romaji && (
              <span className="text-xs font-mono text-muted-foreground/75 tracking-wider block mt-1">
                {word.romaji}
              </span>
            )}
          </div>

          {/* Bottom Flip Cue */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-2 border-t border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground/60">{word.level || "N5"}</span>
            <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
              Tap to reveal
              <RotateCcw className="h-2.5 w-2.5 opacity-60 group-hover:rotate-180 transition-transform duration-500" />
            </span>
          </div>
        </div>

        {/* Back Side (English Translation & Breakdown) */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl border border-primary/30 bg-card p-4 flex flex-col justify-between shadow-xs bg-gradient-to-b from-primary/5 via-card to-card">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {word.partOfSpeech || "Vocabulary"}
            </span>

            <button
              type="button"
              onClick={playAudio}
              disabled={isPlaying}
              className={`p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors ${
                isPlaying ? "animate-pulse" : ""
              }`}
              title="Listen pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* English Meaning Center */}
          <div className="text-center my-auto px-2 py-1 space-y-1.5">
            <h4 className="text-xl font-extrabold text-foreground tracking-tight leading-snug">
              {word.english}
            </h4>
            <div className="font-jp text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <span className="font-semibold text-primary">{word.hiragana}</span>
              {word.kanji && word.kanji !== word.hiragana && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-foreground/80">{word.kanji}</span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Flip Back Cue */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 pt-2 border-t border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground/60">{word.romaji}</span>
            <span className="flex items-center gap-1 text-primary/80">
              Flip back
              <RotateCcw className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Virtualized Grid using @tanstack/react-virtual */
function VirtualizedCardsGrid({
  items,
  flippedMap,
  onToggleCard,
  onLoadMore,
  isLoading,
  columns: forceColumns,
  speechRate,
}: {
  items: EnrichedWord[];
  flippedMap: Record<string, boolean>;
  onToggleCard: (id: string) => void;
  onLoadMore: () => void;
  isLoading?: boolean;
  columns?: number;
  speechRate: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  const getColumns = useCallback((width: number) => {
    if (width < 640) return 1;
    if (width < 860) return 2;
    if (width < 1140) return 3;
    if (width < 1400) return 4;
    return 5;
  }, []);

  const columns = forceColumns ?? getColumns(parentWidth);
  const itemHeight = 224; // Card height (208px) + gap (16px)
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
    scrollMargin: scrollMargin,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= totalRows - 2) {
      onLoadMore();
    }
  }, [virtualItems, totalRows, onLoadMore]);

  return (
    <div ref={parentRef} className="w-full space-y-4">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columns;
          const rowItems = items.slice(rowStartIndex, rowStartIndex + columns);

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
              <div
                className="grid gap-4 h-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {rowItems.map((word) => (
                  <ModernFlashcard
                    key={word.id}
                    word={word}
                    flipped={!!flippedMap[word.id]}
                    onToggle={() => onToggleCard(word.id)}
                    speechRate={speechRate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>Loading more words...</span>
        </div>
      )}
    </div>
  );
}

/* Compact Table View */
function CompactTableView({
  items,
  speechRate,
}: {
  items: EnrichedWord[];
  speechRate: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-secondary/60 text-muted-foreground uppercase text-[11px] font-semibold border-b border-border/80">
            <tr>
              <th className="py-3 px-4">Japanese (Kanji / Kana)</th>
              <th className="py-3 px-4">Romaji</th>
              <th className="py-3 px-4">English Meaning</th>
              <th className="py-3 px-4 hidden sm:table-cell">Topic</th>
              <th className="py-3 px-4 hidden md:table-cell">Type</th>
              <th className="py-3 px-4 text-right">Listen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((word) => (
              <TableRowItem key={word.id} word={word} speechRate={speechRate} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableRowItem({ word, speechRate }: { word: EnrichedWord; speechRate: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await speakJapanese(word.kanji || word.hiragana, {
      rate: speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
    setIsPlaying(false);
  };

  return (
    <tr className="hover:bg-secondary/40 transition-colors">
      <td className="py-3 px-4 font-jp">
        <div className="flex flex-col">
          {word.kanji ? (
            <>
              <span className="font-bold text-foreground text-base">{word.kanji}</span>
              <span className="text-xs text-primary/80 font-medium">{word.hiragana}</span>
            </>
          ) : (
            <span className="font-bold text-foreground text-base">{word.hiragana}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
        {word.romaji}
      </td>
      <td className="py-3 px-4 font-medium text-foreground">
        {word.english}
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground">
          {word.topic || "General"}
        </span>
      </td>
      <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">
        {word.partOfSpeech || "Vocabulary"}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={playAudio}
          disabled={isPlaying}
          className={`p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${
            isPlaying ? "text-primary animate-pulse" : ""
          }`}
          title="Listen"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
