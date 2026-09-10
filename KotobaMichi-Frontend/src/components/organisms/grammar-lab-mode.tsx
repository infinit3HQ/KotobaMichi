"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  JLPT_STAR_QUESTIONS,
  JLPT_PARTICLE_QUESTIONS,
  type GrammarStarQuestion,
  type ParticleClozeQuestion,
  type JLPTLevel,
} from "@/data/grammar";
import {
  ALL_JLPT_GRAMMAR_MASTER,
  type JLPTGrammarMasterItem,
} from "@/data/grammar-master";
import { Input } from "@/components/atoms/input";
import { speakJapanese, playSfx } from "@/lib/audio";
import {
  Star,
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Search,
  BookMarked,
  Layers,
  X,
} from "lucide-react";

interface GrammarLabModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

export function GrammarLabMode({
  selectedLevel,
  soundEnabled,
  speechRate,
}: GrammarLabModeProps) {
  const [subMode, setSubMode] = useState<"star" | "particle" | "handbook">("star");

  // Filter datasets by user's chosen JLPT Level
  const starPool = useMemo(() => {
    return JLPT_STAR_QUESTIONS.filter((q) => q.level === selectedLevel);
  }, [selectedLevel]);

  const particlePool = useMemo(() => {
    return JLPT_PARTICLE_QUESTIONS.filter((q) => q.level === selectedLevel);
  }, [selectedLevel]);

  const handbookPool = useMemo(() => {
    return ALL_JLPT_GRAMMAR_MASTER.filter((item) => item.level === selectedLevel);
  }, [selectedLevel]);

  const subModeSubtitle = {
    star: `${starPool.length} Star Puzzles`,
    particle: `${particlePool.length} Particle Drills`,
    handbook: `${handbookPool.length} Reference Rules`,
  }[subMode];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Submode Switcher & Level Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-bold">
            {selectedLevel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Grammar Dojo • {subModeSubtitle}
          </span>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-muted border overflow-x-auto">
          <button
            onClick={() => setSubMode("star")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subMode === "star" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            ★ Star Ordering
          </button>
          <button
            onClick={() => setSubMode("particle")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subMode === "particle" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Particle Cloze
          </button>
          <button
            onClick={() => setSubMode("handbook")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              subMode === "handbook" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            Grammar Codex ({handbookPool.length})
          </button>
        </div>
      </div>

      {subMode === "star" ? (
        <StarOrderPuzzle
          pool={starPool}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      ) : subMode === "particle" ? (
        <ParticleClozeDrill
          pool={particlePool}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      ) : (
        <GrammarHandbookView
          pool={handbookPool}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      )}
    </div>
  );
}

/* =========================================================================
   SUB-MODE A: JLPT STAR ORDER PUZZLE (文の組み立て)
   ========================================================================= */

function StarOrderPuzzle({
  pool,
  selectedLevel,
  soundEnabled,
  speechRate,
}: {
  pool: GrammarStarQuestion[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [qIndex, setQIndex] = useState(0);
  // slots hold the fragment indices (0, 1, 2, 3) currently placed in slots [0, 1, 2, 3]
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null, null]);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const currentQ = pool[qIndex] || pool[0];


  // Click available tile -> drop into first available slot
  const handleSelectTile = (fragIdx: number) => {
    if (isChecked) return;
    const emptySlot = slots.findIndex((s) => s === null);
    if (emptySlot === -1) return;

    const newSlots = [...slots];
    newSlots[emptySlot] = fragIdx;
    setSlots(newSlots);
    if (soundEnabled) playSfx("flip");
  };

  // Click placed slot -> remove it back to available pool
  const handleRemoveSlot = (slotIdx: number) => {
    if (isChecked) return;
    if (slots[slotIdx] === null) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
    if (soundEnabled) playSfx("flip");
  };

  const handleResetSlots = () => {
    if (isChecked) return;
    setSlots([null, null, null, null]);
  };

  const allFilled = slots.every((s) => s !== null);

  // Check correctness
  const isStarCorrect = useMemo(() => {
    if (!currentQ || !allFilled) return false;
    const slottedInStar = slots[currentQ.starSlotIndex];
    const targetInStar = currentQ.correctOrder[currentQ.starSlotIndex];
    return slottedInStar === targetInStar;
  }, [currentQ, slots, allFilled]);

  const isFullSentenceCorrect = useMemo(() => {
    if (!currentQ || !allFilled) return false;
    return slots.every((fragIdx, slotIdx) => fragIdx === currentQ.correctOrder[slotIdx]);
  }, [currentQ, slots, allFilled]);

  const handleCheck = () => {
    if (!allFilled || isChecked || !currentQ) return;
    setIsChecked(true);
    setTotalAttempts((prev) => prev + 1);

    if (isStarCorrect) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx(isFullSentenceCorrect ? "streak" : "correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }

    // Pronounce the correct full sentence so learner absorbs native flow
    speakJapanese(currentQ.fullSentence, { rate: speechRate });
  };

  const handleNext = () => {
    setSlots([null, null, null, null]);
    setIsChecked(false);
    setQIndex((prev) => (prev + 1) % pool.length);
  };

  if (!currentQ) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground text-sm">
          No {selectedLevel} star puzzles available currently.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {currentQ.level} 文の組み立て
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQ.category}
            </Badge>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Score: {score}/{totalAttempts}
          </div>
        </div>
        <CardTitle className="text-base font-bold pt-2 flex items-center justify-between">
          <span>Arrange the 4 tiles. What goes on the ★ star?</span>
          <span className="text-xs font-normal text-muted-foreground font-mono">
            Puzzle {qIndex + 1}/{pool.length}
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          Tap tiles below to slot them into the sentence in the correct grammatical order.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Sentence Skeleton with 4 Interactive Slots */}
        <div className="p-4 sm:p-6 rounded-2xl bg-muted/40 border-2 border-border/80 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-base sm:text-lg font-bold">
            {/* Sentence Before */}
            {currentQ.sentenceBefore && (
              <span className="text-foreground shrink-0">{currentQ.sentenceBefore}</span>
            )}

            {/* 4 Interactive Drop Slots */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center py-1">
              {[0, 1, 2, 3].map((slotIdx) => {
                const isStar = slotIdx === currentQ.starSlotIndex;
                const fragIdx = slots[slotIdx];
                const hasFrag = fragIdx !== null;
                const fragText = hasFrag ? currentQ.fragments[fragIdx] : "";

                let slotStyle =
                  "border-border/80 bg-background/80 hover:border-primary/60 text-muted-foreground";

                if (isStar) {
                  slotStyle = "border-amber-500/70 bg-amber-500/5 ring-1 ring-amber-500/30 text-amber-600";
                }

                if (hasFrag) {
                  slotStyle = "border-primary bg-primary/10 text-primary font-bold shadow-xs";
                  if (isChecked) {
                    if (isStar) {
                      slotStyle = isStarCorrect
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/30"
                        : "border-destructive bg-destructive/15 text-destructive ring-2 ring-destructive/30";
                    }
                  }
                }

                return (
                  <button
                    key={slotIdx}
                    onClick={() => handleRemoveSlot(slotIdx)}
                    disabled={isChecked}
                    className={`min-w-[70px] sm:min-w-[90px] h-11 sm:h-12 px-2.5 rounded-xl border-2 flex items-center justify-center gap-1 text-sm sm:text-base font-semibold transition-all relative ${slotStyle}`}
                    title={hasFrag ? "Tap to remove tile" : "Empty slot"}
                  >
                    {isStar && (
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500 absolute -top-1.5 -left-1.5 drop-shadow-xs" />
                    )}

                    {hasFrag ? (
                      <span>{fragText}</span>
                    ) : (
                      <span className="text-xs font-mono opacity-50">
                        {isStar ? "★" : `[${slotIdx + 1}]`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sentence After */}
            {currentQ.sentenceAfter && (
              <span className="text-foreground shrink-0">{currentQ.sentenceAfter}</span>
            )}
          </div>
        </div>

        {/* Tile Selection Tray */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Available Tiles (Tap to place):</span>
            {!isChecked && slots.some((s) => s !== null) && (
              <button
                onClick={handleResetSlots}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentQ.fragments.map((frag, idx) => {
              const isSlotted = slots.includes(idx);

              return (
                <button
                  key={idx}
                  disabled={isSlotted || isChecked}
                  onClick={() => handleSelectTile(idx)}
                  className={`p-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-between ${
                    isSlotted
                      ? "opacity-30 border-dashed bg-muted/40 cursor-not-allowed"
                      : "border-border bg-card hover:border-primary hover:bg-primary/5 hover:scale-102 active:scale-98 shadow-xs"
                  }`}
                >
                  <span className="truncate">{frag}</span>
                  <span className="text-[11px] font-mono text-muted-foreground ml-1">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Check Answer */}
        {!isChecked ? (
          <Button
            onClick={handleCheck}
            disabled={!allFilled}
            className="w-full gap-2 text-sm font-semibold"
            size="lg"
          >
            <CheckCircle2 className="h-4 w-4" /> Check Star (★) Position
          </Button>
        ) : (
          /* Result & Explanation Card */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isStarCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-destructive/10 border-destructive/30 text-destructive dark:text-destructive-foreground"
              }`}
            >
              {isStarCorrect ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {isStarCorrect
                    ? isFullSentenceCorrect
                      ? "★ Perfect! Full sentence is 100% correct!"
                      : "★ Correct Star! Star tile is correct!"
                    : "Not quite! Look at the grammar pattern."}
                </div>
                <div className="text-xs opacity-90">
                  Target star tile:{" "}
                  <strong className="underline">
                    {currentQ.fragments[currentQ.correctOrder[currentQ.starSlotIndex]]}
                  </strong>
                </div>
              </div>
            </div>

            {/* Grammar Explanation Box */}
            <div className="p-4 rounded-xl bg-muted/50 border space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Grammar Rule: {currentQ.grammarPoint}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakJapanese(currentQ.fullSentence, { rate: speechRate })}
                  className="h-7 text-xs gap-1"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" /> Hear Sentence
                </Button>
              </div>

              <div className="text-sm font-semibold text-foreground">
                {currentQ.fullSentence}
              </div>
              <div className="text-xs text-muted-foreground italic">
                &ldquo;{currentQ.english}&rdquo;
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t">
                {currentQ.explanation}
              </p>
            </div>

            <Button onClick={handleNext} className="w-full gap-2" size="lg">
              Next Star Puzzle <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   SUB-MODE B: JLPT PARTICLE CLOZE DRILL (助詞マスター)
   ========================================================================= */

function ParticleClozeDrill({
  pool,
  selectedLevel,
  soundEnabled,
  speechRate,
}: {
  pool: ParticleClozeQuestion[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const currentQ = pool[qIndex] || pool[0];

  const handleSelect = (choice: string) => {
    if (selectedParticle !== null || !currentQ) return;
    setSelectedParticle(choice);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = choice === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }

    speakJapanese(currentQ.fullSentence, { rate: speechRate });
  };

  const handleNext = () => {
    setSelectedParticle(null);
    setQIndex((prev) => (prev + 1) % pool.length);
  };

  if (!currentQ) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground text-sm">
          No {selectedLevel} particle drills available currently.
        </p>
      </Card>
    );
  }

  const isAnswered = selectedParticle !== null;
  const isCorrect = selectedParticle === currentQ.correctAnswer;

  return (
    <Card className="border-2 shadow-md">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Sparkles className="h-3 w-3" />
            {currentQ.level} 助詞マスター
          </Badge>
          <div className="text-xs font-mono text-muted-foreground">
            Score: {score}/{totalAttempts}
          </div>
        </div>
        <CardTitle className="text-base font-bold pt-2">
          Choose the correct particle for the blank:
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Sentence Prompt Card */}
        <div className="p-6 rounded-2xl bg-muted/40 border-2 text-center space-y-3">
          <div className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-1.5 flex-wrap">
            <span>{currentQ.sentenceBefore}</span>
            <span
              className={`inline-flex items-center justify-center min-w-[48px] h-10 px-3 rounded-lg border-2 font-bold text-lg transition-all ${
                !isAnswered
                  ? "border-dashed border-primary/50 text-primary bg-primary/5"
                  : isCorrect
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-600"
                  : "border-destructive bg-destructive/20 text-destructive"
              }`}
            >
              {selectedParticle || "?"}
            </span>
            <span>{currentQ.sentenceAfter}</span>
          </div>

          <div className="text-xs text-muted-foreground italic">
            &ldquo;{currentQ.english}&rdquo;
          </div>
        </div>

        {/* 4 Particle Option Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isChosen = selectedParticle === opt;
            const isTarget = opt === currentQ.correctAnswer;

            let btnStyle = "border-border hover:border-primary hover:bg-primary/5";
            if (isAnswered) {
              if (isTarget) {
                btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-600 font-bold ring-2 ring-emerald-500/30";
              } else if (isChosen && !isTarget) {
                btnStyle = "border-destructive bg-destructive/15 text-destructive";
              } else {
                btnStyle = "opacity-40";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(opt)}
                className={`h-16 rounded-xl border-2 text-xl font-bold transition-all flex items-center justify-center ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next */}
        {isAnswered && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 rounded-xl bg-muted/50 border space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-primary">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Particle Usage Rule:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakJapanese(currentQ.fullSentence, { rate: speechRate })}
                  className="h-7 text-xs gap-1"
                >
                  <Volume2 className="h-3.5 w-3.5 text-primary" /> Hear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>

            <Button onClick={handleNext} className="w-full gap-2" size="lg">
              Next Particle Drill <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   SUB-MODE C: JLPT GRAMMAR CODEX (文法ハンドブック & 例文ライブラリ)
   ========================================================================= */

interface GrammarHandbookViewProps {
  pool: JLPTGrammarMasterItem[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

function GrammarHandbookView({
  pool,
  selectedLevel,
  soundEnabled,
  speechRate,
}: GrammarHandbookViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return pool;
    const q = searchQuery.toLowerCase().trim();
    return pool.filter(
      (item) =>
        item.point.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.formation?.toLowerCase().includes(q) ||
        item.exampleJapanese.toLowerCase().includes(q) ||
        item.exampleRomaji?.toLowerCase().includes(q) ||
        item.exampleEnglish.toLowerCase().includes(q)
    );
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
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-xl border bg-card/60 backdrop-blur-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedLevel} grammar or patterns...`}
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

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-muted-foreground">
          <BookMarked className="h-3.5 w-3.5 text-primary" />
          <span>
            Showing <strong className="text-foreground">{filteredItems.length}</strong> of {pool.length} points
          </span>
        </div>
      </div>

      {/* Results List */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No grammar points match &ldquo;{searchQuery}&rdquo;</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try searching for another pattern, meaning, or Japanese keyword.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4"
          >
            Clear Search
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isPlaying = playingId === item.id;
            return (
              <Card
                key={item.id}
                className="overflow-hidden border border-border/80 hover:border-primary/40 transition-all shadow-xs"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Top: Point & Level */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[11px] font-bold text-primary border-primary/30">
                          {item.level}
                        </Badge>
                        <h3 className="text-lg font-bold text-foreground font-japanese tracking-wide">
                          {item.point}
                        </h3>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 leading-snug">
                        {item.meaning}
                      </p>
                    </div>

                    <Button
                      variant={isPlaying ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handlePlayAudio(item)}
                      className={`shrink-0 gap-1.5 h-8 text-xs ${
                        isPlaying ? "animate-pulse" : ""
                      }`}
                      title="Listen to Japanese example sentence"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Audio</span>
                    </Button>
                  </div>

                  {/* Formation Pattern */}
                  {item.formation && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-muted-foreground/10 text-xs font-mono">
                      <Layers className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-muted-foreground shrink-0 font-sans font-semibold">Formation:</span>
                      <span className="text-foreground overflow-x-auto select-all">{item.formation}</span>
                    </div>
                  )}

                  {/* Example Sentence Box */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70">
                        Example Sentence
                      </span>
                    </div>
                    <div className="text-base font-semibold text-foreground font-japanese tracking-wide">
                      {item.exampleJapanese}
                    </div>
                    {item.exampleRomaji && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {item.exampleRomaji}
                      </div>
                    )}
                    <div className="text-xs text-foreground/80 italic pt-0.5">
                      &ldquo;{item.exampleEnglish}&rdquo;
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

