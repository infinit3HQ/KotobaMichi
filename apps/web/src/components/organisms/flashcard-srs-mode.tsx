"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import type { JLPTWord } from "@/data/vocab-n5";
import { wordsForTopic } from "@/data/level-words";
import { getSentencesForWord } from "@/data/sentences";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese, playSfx } from "@/lib/audio";
import { ArrowLeft, ArrowRight, Eye, EyeOff, RotateCw, Volume2 } from "lucide-react";
import { KeyHint } from "@/components/organisms/practice/drill-parts";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/organisms/locale-provider";
import { lessonText, sinhalaWordGloss } from "@/lib/i18n/content-si";
import { useLearning } from "@/hooks/use-learning";
import type { LearningGrade } from "@/lib/learning";

const GRADES: {
  grade: LearningGrade;
  label: string;
  interval: string;
  sfx: "wrong" | "correct" | "streak";
  tone?: string;
}[] = [
  { grade: "again", label: "Again", interval: "<1m", sfx: "wrong", tone: "text-destructive" },
  { grade: "hard", label: "Hard", interval: "1d", sfx: "correct" },
  { grade: "good", label: "Good", interval: "3d", sfx: "correct" },
  { grade: "easy", label: "Easy", interval: "7d", sfx: "streak", tone: "text-chart-3" },
];

const FACE =
  "absolute inset-0 backface-hidden flex flex-col items-center justify-between gap-4 rounded-xl border bg-card p-4 text-center shadow-sm sm:p-6";

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
  const { locale } = useLocale();
  const { user, summary, due, ready, record, savePlace } = useLearning(selectedLevel);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deck, setDeck] = useState<JLPTWord[] | null>(null);
  const builtFor = useRef<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);

  const wordPool = useMemo(
    () => wordsForTopic(selectedLevel, selectedTopic),
    [selectedLevel, selectedTopic],
  );

  const sessionKey = `${selectedLevel}:${selectedTopic}:${due.join(",")}`;
  useEffect(() => {
    if (!ready) return;
    if (builtFor.current === sessionKey) return;
    builtFor.current = sessionKey;
    const byId = new Map(wordPool.map((word) => [word.id, word]));
    const dueWords = due.map((id) => byId.get(id)).filter((word): word is JLPTWord => !!word);
    const dueSet = new Set(dueWords.map((word) => word.id));
    const rest = wordPool.filter((word) => !dueSet.has(word.id));
    const bookmark = summary?.bookmarks?.[selectedLevel];
    let start = 0;
    if (bookmark?.itemKey) {
      const found = rest.findIndex((word) => word.id === bookmark.itemKey);
      if (found >= 0) start = found;
    }
    const ordered = [...dueWords, ...rest.slice(start), ...rest.slice(0, start)];
    setDeck(ordered.length > 0 ? ordered : wordPool);
    setCurrentIndex(0);
    setFlipped(false);
  }, [ready, sessionKey, wordPool, due, summary, selectedLevel]);

  const cards = deck ?? wordPool;
  const currentWord = cards[currentIndex] || cards[0];

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
    if (soundEnabled) playSfx("flip");
  }, [soundEnabled]);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(cards.length, 1));
  }, [cards.length]);

  const prevCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % Math.max(cards.length, 1));
  }, [cards.length]);

  const gradeCard = useCallback(
    (grade: LearningGrade) => {
      // Guests are recorded too; their reviews sync after sign-in.
      if (currentWord) {
        void record(currentWord.id, selectedLevel, grade).catch(() => undefined);
      }
      nextCard();
    },
    [currentWord, record, selectedLevel, nextCard]
  );

  useEffect(() => {
    if (!user || !deck || !currentWord) return;
    const handle = window.setTimeout(() => {
      void savePlace({
        level: selectedLevel,
        mode: "flashcard",
        itemKey: currentWord.id,
        cursor: currentIndex,
      }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(handle);
  }, [user, deck, currentWord, currentIndex, selectedLevel, savePlace]);

  // Keyboard shortcuts: Space flips, arrows move, R pronounces, 1-4 grade the card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const gradeIndex = ["1", "2", "3", "4"].indexOf(e.key);
      if (gradeIndex >= 0) {
        const { grade, sfx } = GRADES[gradeIndex];
        if (soundEnabled) playSfx(sfx);
        gradeCard(grade);
        return;
      }
      if (e.code === "Space") {
        // Space on a focused button or link should press that control, not flip the card.
        if (tag === "BUTTON" || tag === "A") return;
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
  }, [handleFlip, nextCard, prevCard, currentWord, speechRate, gradeCard, soundEnabled]);

  if (!currentWord) return null;

  const exampleSentences = getSentencesForWord(currentWord.kanji || currentWord.hiragana);
  const topExample = exampleSentences[0];

  const word = currentWord.kanji || currentWord.hiragana;
  const sinhalaGloss = locale === "si" ? sinhalaWordGloss(currentWord) : null;
  const pronounce = () => speakJapanese(word, { rate: speechRate });

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            aria-pressed={showFurigana}
            onClick={() => setShowFurigana((open) => !open)}
          >
            {showFurigana ? <Eye /> : <EyeOff />}
            Furigana
          </Button>
          <Button variant="outline" aria-pressed={showRomaji} onClick={() => setShowRomaji((open) => !open)}>
            {showRomaji ? <Eye /> : <EyeOff />}
            Romaji
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevCard} aria-label="Previous card">
            <ArrowLeft />
          </Button>
          <span className="min-w-14 text-center font-mono text-sm tabular-nums text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
          <Button variant="outline" size="icon" onClick={nextCard} aria-label="Next card">
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Show the word" : "Show the meaning"}
        onClick={handleFlip}
        onKeyDown={(e) => {
          // Keys pressed on the Listen buttons inside the card bubble up here; only the card itself flips.
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter") handleFlip();
        }}
        className="perspective group w-full cursor-pointer select-none rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <div
          className={cn(
            "preserve-3d relative min-h-[320px] w-full transition-transform duration-500",
            flipped && "rotate-y-180"
          )}
        >
          {/* Front: the word */}
          <div className={cn(FACE, "transition-colors group-hover:border-primary/40")} aria-hidden={flipped}>
            <div className="flex w-full items-center justify-between gap-2">
              <Badge variant="outline">{currentWord.topic}</Badge>
              <Badge variant="secondary" className="font-mono">
                {currentWord.level}
              </Badge>
            </div>

            <div className="w-full space-y-2">
              {showFurigana && currentWord.kanji ? (
                <p lang="ja" className="font-jp text-base text-primary">
                  {currentWord.hiragana}
                </p>
              ) : null}
              <p lang="ja" className="font-jp text-5xl font-bold leading-tight tracking-tight break-words sm:text-6xl">
                {word}
              </p>
              {showRomaji ? <p className="font-mono text-sm text-muted-foreground">{currentWord.romaji}</p> : null}
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  pronounce();
                }}
              >
                <Volume2 />
                Listen
                <KeyHint>R</KeyHint>
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCw className="size-3.5" />
                <span className="sm:hidden">Tap to flip</span>
                <span className="hidden sm:inline">Click or press Space to flip</span>
              </span>
            </div>
          </div>

          {/* Back: meaning and an example sentence */}
          <div className={cn(FACE, "rotate-y-180 overflow-y-auto")} aria-hidden={!flipped}>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Meaning</span>
              <Badge variant="outline">{currentWord.partOfSpeech}</Badge>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
                  {sinhalaGloss ?? currentWord.english}
                </p>
                {sinhalaGloss ? <p className="text-sm text-muted-foreground">{currentWord.english}</p> : null}
                <p lang="ja" className="font-jp text-sm text-muted-foreground">
                  {currentWord.kanji ? `${currentWord.kanji} (${currentWord.hiragana})` : currentWord.hiragana}
                </p>
              </div>

              {topExample ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="space-y-1 rounded-lg bg-muted/60 p-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Example <span className="font-jp">例文</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Listen to the example sentence"
                      onClick={() => speakJapanese(topExample.ja, { rate: speechRate })}
                    >
                      <Volume2 />
                    </Button>
                  </div>
                  <p lang="ja" className="font-jp text-sm font-medium leading-relaxed break-words">
                    {topExample.ja}
                  </p>
                  <p className="text-xs leading-snug text-muted-foreground">{lessonText(locale, topExample.en)}</p>
                </div>
              ) : null}
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  pronounce();
                }}
              >
                <Volume2 />
                Listen
              </Button>
              <span className="text-xs text-muted-foreground">How well did you remember it?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced-repetition grades */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Grade this card">
        {GRADES.map(({ grade, label, interval, sfx, tone }, idx) => (
          <Button
            key={grade}
            variant="outline"
            className="justify-between"
            onClick={() => {
              if (soundEnabled) playSfx(sfx);
              gradeCard(grade);
            }}
          >
            <span className={cn("font-semibold", tone)}>{label}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {interval}
              <KeyHint>{idx + 1}</KeyHint>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
