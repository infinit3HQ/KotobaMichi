"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { JLPT_N5_WORDS } from "@/data/vocab-n5";
import { JLPT_N4_WORDS, JLPT_N3_WORDS } from "@/data/vocab-more";
import { getTanosWordsByLevel } from "@/data/vocab-tanos";
import { getSentencesForWord } from "@/data/sentences";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese, playSfx } from "@/lib/audio";
import { Volume2, Eye, EyeOff, Sparkles, RotateCw, ArrowLeft, ArrowRight } from "lucide-react";

interface FlashcardSrsModeProps {
  selectedLevel: JLPTLevel;
  selectedTopic: string;
  soundEnabled: boolean;
  speechRate: number;
}

export function FlashcardSrsMode({
  selectedLevel,
  selectedTopic,
  soundEnabled,
  speechRate,
}: FlashcardSrsModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);

  const levelWords = useMemo(() => {
    const tanos = getTanosWordsByLevel(selectedLevel);
    if (tanos && tanos.length > 0) return tanos;
    if (selectedLevel === "N4") return JLPT_N4_WORDS;
    if (selectedLevel === "N3") return JLPT_N3_WORDS;
    return JLPT_N5_WORDS;
  }, [selectedLevel]);

  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return levelWords;
    return levelWords.filter((w) => w.topic === selectedTopic);
  }, [levelWords, selectedTopic]);

  const currentWord = wordPool[currentIndex] || wordPool[0];

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
    if (soundEnabled) playSfx("flip");
  }, [soundEnabled]);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % wordPool.length);
  }, [wordPool.length]);

  const prevCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + wordPool.length) % wordPool.length);
  }, [wordPool.length]);

  // Keyboard shortcut: Space to flip, Arrows to navigate, R to pronounce
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        nextCard();
      } else if (e.code === "ArrowLeft") {
        prevCard();
      } else if (e.key.toLowerCase() === "r" && currentWord) {
        speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, nextCard, prevCard, currentWord, speechRate]);

  if (!currentWord) return null;

  const exampleSentences = getSentencesForWord(currentWord.kanji || currentWord.hiragana);
  const topExample = exampleSentences[0];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Settings and Progress Bar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant={showFurigana ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFurigana(!showFurigana)}
            className="text-xs h-7 px-2.5 rounded-lg gap-1.5 font-medium"
          >
            {showFurigana ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
            Furigana
          </Button>
          <Button
            variant={showRomaji ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowRomaji(!showRomaji)}
            className="text-xs h-7 px-2.5 rounded-lg font-mono font-medium"
          >
            Romaji
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevCard}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Previous Card (Left Arrow)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono font-bold">
            {currentIndex + 1} <span className="opacity-40">/</span> {wordPool.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextCard}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Next Card (Right Arrow)"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* True 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="perspective w-full min-h-[350px] cursor-pointer select-none group"
      >
        <div
          className={`relative w-full min-h-[350px] transition-transform duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* =============================================================
              CARD FRONT: PROMPT & KANJI
              ============================================================= */}
          <div className="absolute inset-0 backface-hidden rounded-3xl border-2 border-primary/20 bg-card/95 backdrop-blur-md p-8 flex flex-col justify-between items-center text-center shadow-lg group-hover:border-primary/45 transition-all duration-300">
            {/* Header badges */}
            <div className="w-full flex justify-between items-center text-xs">
              <Badge variant="outline" className="text-[11px] font-semibold">
                {currentWord.topic}
              </Badge>
              <span className="text-muted-foreground/80 text-[11px] font-medium flex items-center gap-1 group-hover:text-primary transition-colors">
                <RotateCw className="h-3 w-3" /> [Space] to flip
              </span>
              <Badge variant="secondary" className="font-mono text-[11px] font-bold">
                {currentWord.level}
              </Badge>
            </div>

            {/* Center: Character display */}
            <div className="my-auto space-y-3 py-4">
              {showFurigana && currentWord.kanji && (
                <div className="text-lg font-japanese font-medium text-primary tracking-widest animate-in fade-in duration-150">
                  {currentWord.hiragana}
                </div>
              )}
              <div className="text-5xl sm:text-6xl font-black font-japanese tracking-tight text-foreground drop-shadow-xs">
                {currentWord.kanji || currentWord.hiragana}
              </div>
              {showRomaji && (
                <div className="text-xs sm:text-sm text-muted-foreground font-mono tracking-wider">
                  {currentWord.romaji}
                </div>
              )}
            </div>

            {/* Front footer controls */}
            <div className="w-full flex justify-between items-center pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
                }}
                className="gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl"
              >
                <Volume2 className="h-4 w-4" /> Listen (R)
              </Button>

              <span className="text-[11px] text-muted-foreground font-medium">
                Tap card to reveal definition
              </span>
            </div>
          </div>

          {/* =============================================================
              CARD BACK: MEANING, PART OF SPEECH & REAL SENTENCE
              ============================================================= */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-primary/35 bg-card/95 backdrop-blur-md p-8 flex flex-col justify-between items-center text-center shadow-xl">
            {/* Header tags */}
            <div className="w-full flex justify-between items-center text-xs">
              <span className="text-[11px] font-mono font-bold text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Answer & Context
              </span>
              <Badge variant="outline" className="text-[10px]">
                {currentWord.partOfSpeech}
              </Badge>
            </div>

            {/* Center: Definition & Example */}
            <div className="my-auto space-y-3 py-2 w-full max-w-md">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                {currentWord.english}
              </div>
              <div className="text-sm font-medium text-foreground/80 font-japanese">
                {currentWord.kanji ? `${currentWord.kanji} (${currentWord.hiragana})` : currentWord.hiragana}
              </div>

              {/* Contextual Example from 5,193 sentences database */}
              {topExample && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 p-3 rounded-2xl bg-muted/50 border border-border/60 text-left space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-primary font-mono tracking-wider">
                      Authentic Example • 例文
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
                      onClick={() => speakJapanese(topExample.ja, { rate: speechRate })}
                      title="Listen to example sentence"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-xs sm:text-sm font-japanese font-semibold text-foreground leading-snug">
                    {topExample.ja}
                  </div>
                  <div className="text-[11px] text-muted-foreground italic leading-tight">
                    {topExample.en}
                  </div>
                </div>
              )}
            </div>

            {/* Back footer controls */}
            <div className="w-full flex justify-between items-center pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
                }}
                className="gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl"
              >
                <Volume2 className="h-4 w-4" /> Pronounce
              </Button>

              <span className="text-[11px] text-muted-foreground">
                Grade your recall below:
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SRS Confidence Buttons (SuperMemo-Style Repetition) */}
      <div className="grid grid-cols-4 gap-2.5">
        <Button
          variant="outline"
          className="border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-600 text-xs flex flex-col py-3.5 h-auto rounded-2xl transition-all shadow-2xs group"
          onClick={() => {
            if (soundEnabled) playSfx("wrong");
            nextCard();
          }}
        >
          <span className="font-bold text-sm text-rose-600 dark:text-rose-400">Again</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-rose-500/80">&lt; 1m</span>
        </Button>
        <Button
          variant="outline"
          className="border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-600 text-xs flex flex-col py-3.5 h-auto rounded-2xl transition-all shadow-2xs group"
          onClick={() => {
            if (soundEnabled) playSfx("correct");
            nextCard();
          }}
        >
          <span className="font-bold text-sm text-amber-600 dark:text-amber-400">Hard</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-amber-500/80">1d</span>
        </Button>
        <Button
          variant="outline"
          className="border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-600 text-xs flex flex-col py-3.5 h-auto rounded-2xl transition-all shadow-2xs group"
          onClick={() => {
            if (soundEnabled) playSfx("correct");
            nextCard();
          }}
        >
          <span className="font-bold text-sm text-sky-600 dark:text-sky-400">Good</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-sky-500/80">3d</span>
        </Button>
        <Button
          variant="outline"
          className="border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 text-xs flex flex-col py-3.5 h-auto rounded-2xl transition-all shadow-2xs group"
          onClick={() => {
            if (soundEnabled) playSfx("streak");
            nextCard();
          }}
        >
          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Easy</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 group-hover:text-emerald-500/80">7d</span>
        </Button>
      </div>
    </div>
  );
}
