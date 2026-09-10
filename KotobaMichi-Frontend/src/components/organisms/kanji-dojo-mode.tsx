"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Input } from "@/components/atoms/input";
import {
  ALL_JLPT_KANJI_MASTER,
  type KanjiMasterItem,
} from "@/data/kanji-master";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese, playSfx } from "@/lib/audio";
import {
  Search,
  Volume2,
  Sparkles,
  Puzzle,
  BookOpen,
  CheckCircle2,
  XCircle,
  Layers,
  Lightbulb,
  X,
  ArrowRight,
} from "lucide-react";

interface KanjiDojoModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

export function KanjiDojoMode({
  selectedLevel,
  soundEnabled,
  speechRate,
}: KanjiDojoModeProps) {
  const [subMode, setSubMode] = useState<"cards" | "puzzle">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKanjiId, setSelectedKanjiId] = useState<string | null>(null);

  // Pool for the active level
  const kanjiPool = useMemo(() => {
    return ALL_JLPT_KANJI_MASTER.filter((k) => k.level === selectedLevel);
  }, [selectedLevel]);

  // Filtered by user search
  const filteredKanji = useMemo(() => {
    if (!searchQuery.trim()) return kanjiPool;
    const q = searchQuery.toLowerCase().trim();
    return kanjiPool.filter(
      (k) =>
        k.character.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.dominantReading?.toLowerCase().includes(q) ||
        k.radicals.some(
          (r) =>
            r.character.includes(q) || r.meaning.toLowerCase().includes(q)
        ) ||
        k.vocabulary.some(
          (v) =>
            v.word.includes(q) ||
            v.reading.includes(q) ||
            v.meaning.toLowerCase().includes(q)
        )
    );
  }, [kanjiPool, searchQuery]);

  // Active Kanji for detailed anatomy view (default to first in pool)
  const activeKanji = useMemo(() => {
    if (selectedKanjiId) {
      const found = kanjiPool.find((k) => k.id === selectedKanjiId);
      if (found) return found;
    }
    return filteredKanji[0] || kanjiPool[0] || null;
  }, [selectedKanjiId, kanjiPool, filteredKanji]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Submode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl border bg-card/70 backdrop-blur shadow-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="default" className="font-bold font-mono">
            {selectedLevel}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            Kanji Dojo • {kanjiPool.length} Characters in Curriculum
          </span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-muted border">
          <button
            onClick={() => setSubMode("cards")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              subMode === "cards"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Anatomy & Radicals
          </button>
          <button
            onClick={() => setSubMode("puzzle")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              subMode === "puzzle"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Puzzle className="h-3.5 w-3.5 text-amber-500" />
            Radical Forge Puzzle
          </button>
        </div>
      </div>

      {subMode === "cards" ? (
        <KanjiAnatomyView
          pool={kanjiPool}
          filtered={filteredKanji}
          activeKanji={activeKanji}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectKanji={(id) => setSelectedKanjiId(id)}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
          selectedLevel={selectedLevel}
        />
      ) : (
        <RadicalForgePuzzle
          pool={kanjiPool}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
          selectedLevel={selectedLevel}
        />
      )}
    </div>
  );
}

/* =========================================================================
   SUB-MODE 1: KANJI ANATOMY & RADICAL MATRIX
   ========================================================================= */

interface KanjiAnatomyViewProps {
  pool: KanjiMasterItem[];
  filtered: KanjiMasterItem[];
  activeKanji: KanjiMasterItem | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectKanji: (id: string) => void;
  soundEnabled: boolean;
  speechRate: number;
  selectedLevel: JLPTLevel;
}

function KanjiAnatomyView({
  pool,
  filtered,
  activeKanji,
  searchQuery,
  setSearchQuery,
  onSelectKanji,
  soundEnabled,
  speechRate,
  selectedLevel,
}: KanjiAnatomyViewProps) {
  const playWordAudio = (text: string) => {
    if (!soundEnabled) return;
    speakJapanese(text, { rate: speechRate });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedLevel} kanji (e.g. 学, study, ガク, book)...`}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs text-muted-foreground shrink-0 font-medium">
          {filtered.length} of {pool.length}
        </div>
      </div>

      {/* Main Grid & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Active Kanji Detailed Breakdown */}
        {activeKanji && (
          <Card className="lg:col-span-7 border-2 border-primary/20 shadow-sm overflow-hidden animate-in fade-in-50 duration-200">
            <CardContent className="p-6 space-y-6">
              {/* Header Box */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Giant Character Tile */}
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-5xl font-bold font-japanese text-primary shadow-inner shrink-0">
                    {activeKanji.character}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/40">
                        {activeKanji.level}
                      </Badge>
                      {activeKanji.dominantReading && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-japanese">
                          {activeKanji.dominantReading}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {activeKanji.meaning}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Radical count: {activeKanji.radicals.length}
                    </p>
                  </div>
                </div>

                {/* Speak Character Audio */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => playWordAudio(activeKanji.character)}
                  title="Listen to Kanji Pronunciation"
                  className="rounded-xl h-10 w-10 shrink-0"
                >
                  <Volume2 className="h-4 w-4 text-primary" />
                </Button>
              </div>

              {/* Radical Anatomy Decomposition */}
              {activeKanji.radicals.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/40 border border-muted-foreground/15 space-y-2.5">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-primary">
                    <Layers className="h-3.5 w-3.5 text-amber-500" />
                    Radical Decomposition (部首構成):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeKanji.radicals.map((rad, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border shadow-2xs"
                      >
                        <span className="text-lg font-bold font-japanese text-foreground">
                          {rad.character}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {rad.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mnemonic Story */}
              {activeKanji.mnemonic && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Memory Mnemonic:
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed italic">
                    &ldquo;{activeKanji.mnemonic}&rdquo;
                  </p>
                </div>
              )}

              {/* Compound Vocabulary Matrix */}
              {activeKanji.vocabulary.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-foreground/80">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    High-Frequency Compound Vocabulary:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeKanji.vocabulary.map((vocab, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border bg-card/80 hover:border-primary/40 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold font-japanese text-foreground">
                              {vocab.word}
                            </span>
                            <span className="text-xs text-muted-foreground font-japanese">
                              ({vocab.reading})
                            </span>
                          </div>
                          <div className="text-xs text-foreground/80 truncate">
                            {vocab.meaning}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playWordAudio(vocab.word)}
                          className="h-8 w-8 shrink-0 rounded-lg opacity-80 group-hover:opacity-100"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Right / Bottom: Interactive Kanji Selection Grid */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Tap a Kanji to Inspect ({filtered.length})
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[500px] overflow-y-auto pr-1 p-1">
            {filtered.map((k) => {
              const isSelected = activeKanji?.id === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => onSelectKanji(k.id)}
                  className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-105 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <span className="text-2xl font-japanese font-semibold leading-tight">
                    {k.character}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[90%] font-medium">
                    {k.meaning.split(",")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-MODE 2: RADICAL FORGE PUZZLE (部首合体パズル)
   ========================================================================= */

interface RadicalForgePuzzleProps {
  pool: KanjiMasterItem[];
  soundEnabled: boolean;
  speechRate: number;
  selectedLevel: JLPTLevel;
}

function RadicalForgePuzzle({
  pool,
  soundEnabled,
  speechRate,
  selectedLevel,
}: RadicalForgePuzzleProps) {
  // Only use kanji that have 2 or more radicals for the puzzle
  const puzzlePool = useMemo(() => {
    return pool.filter((k) => k.radicals && k.radicals.length >= 2);
  }, [pool]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRadicals, setSelectedRadicals] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentKanji = puzzlePool[currentIndex % (puzzlePool.length || 1)];

  // Create option bank (correct radicals + distractor radicals)
  const optionBank = useMemo(() => {
    if (!currentKanji) return [];
    const correctRadChars = currentKanji.radicals.map((r) => r.character);
    // Grab distractors from other kanji in pool
    const distractors: string[] = [];
    for (const other of pool) {
      if (other.id !== currentKanji.id) {
        for (const r of other.radicals) {
          if (
            !correctRadChars.includes(r.character) &&
            !distractors.includes(r.character)
          ) {
            distractors.push(r.character);
            if (distractors.length >= 4) break;
          }
        }
      }
      if (distractors.length >= 4) break;
    }
    const combined = [...correctRadChars, ...distractors];
    // Deterministic shuffle
    return combined.sort();
  }, [currentKanji, pool]);

  const handleToggleRadical = (radChar: string) => {
    if (isAnswered) return;
    if (selectedRadicals.includes(radChar)) {
      setSelectedRadicals((prev) => prev.filter((r) => r !== radChar));
    } else {
      setSelectedRadicals((prev) => [...prev, radChar]);
    }
  };

  const handleVerify = () => {
    if (!currentKanji || selectedRadicals.length === 0) return;
    const correctChars = currentKanji.radicals.map((r) => r.character).sort();
    const userChars = [...selectedRadicals].sort();

    const correct =
      correctChars.length === userChars.length &&
      correctChars.every((c, i) => c === userChars[i]);

    setIsCorrect(correct);
    setIsAnswered(true);

    if (soundEnabled) {
      playSfx(correct ? "correct" : "wrong");
      if (correct) {
        speakJapanese(currentKanji.character, { rate: speechRate });
      }
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedRadicals([]);
    setCurrentIndex((prev) => (prev + 1) % puzzlePool.length);
  };

  if (!currentKanji) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No radical puzzles available for this level.
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto border-2 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs font-mono font-bold text-primary">
            Puzzle {currentIndex + 1} of {puzzlePool.length} ({selectedLevel})
          </Badge>
          <div className="text-4xl font-bold font-japanese text-foreground tracking-wide">
            {currentKanji.character}
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            &ldquo;{currentKanji.meaning}&rdquo;
          </p>
          <p className="text-xs text-primary font-medium">
            Select the {currentKanji.radicals.length} radicals that combine to form this Kanji:
          </p>
        </div>

        {/* Selected Slot Preview */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50 border min-h-[64px]">
          {selectedRadicals.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">
              Tap the radicals below to add them here...
            </span>
          ) : (
            selectedRadicals.map((rad, idx) => (
              <span
                key={idx}
                className="w-12 h-12 rounded-xl bg-card border-2 border-primary/40 flex items-center justify-center text-2xl font-bold font-japanese text-primary shadow-xs"
              >
                {rad}
              </span>
            ))
          )}
        </div>

        {/* Radical Option Bank */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {optionBank.map((rad, idx) => {
            const isSelected = selectedRadicals.includes(rad);
            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleToggleRadical(rad)}
                className={`h-14 rounded-xl border-2 text-2xl font-japanese font-bold transition-all flex items-center justify-center ${
                  isSelected
                    ? "border-primary bg-primary/15 text-primary shadow-xs scale-105 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 text-foreground"
                }`}
              >
                {rad}
              </button>
            );
          })}
        </div>

        {/* Actions & Result */}
        {!isAnswered ? (
          <Button
            onClick={handleVerify}
            disabled={selectedRadicals.length === 0}
            className="w-full font-bold"
            size="lg"
          >
            Forge Kanji (合体する)
          </Button>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {isCorrect ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-destructive/20 border border-destructive/40 flex items-center justify-center shrink-0">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              )}
              <div className="text-xs space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">
                    {isCorrect ? "Successfully Forged!" : "Not quite right!"}
                  </p>
                  {isCorrect && (
                    <span className="text-[10px] font-bold font-japanese px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      合格 合体成功
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 font-medium">
                  Radicals for <strong className="font-japanese text-sm">{currentKanji.character}</strong>:{" "}
                  {currentKanji.radicals
                    .map((r) => `${r.character} (${r.meaning})`)
                    .join(" + ")}
                </p>
                {currentKanji.mnemonic && (
                  <p className="text-[11px] text-muted-foreground italic pt-0.5">
                    💡 Mnemonic: &ldquo;{currentKanji.mnemonic}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleNext} className="w-full gap-2 font-bold rounded-2xl shadow-xs" size="lg">
              Next Kanji Puzzle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
