"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Star, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { GrammarStarQuestion, JLPTLevel } from "@/data/grammar";
import { playSfx, speakJapanese } from "@/lib/audio";
import { DRILL_SI, lessonText } from "@/lib/i18n/content-si";
import { cn } from "@/lib/utils";
import {
  DrillCard,
  DrillFooter,
  DrillProgress,
  ExplanationBlock,
  FeedbackBanner,
} from "./drill-ui";

const EMPTY_SLOTS: readonly (number | null)[] = [null, null, null, null];

type StarPuzzleProps = {
  pool: GrammarStarQuestion[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

/** JLPT 文の組み立て: put four fragments in order and get the ★ slot right. */
export function GrammarStarPuzzle({ pool, selectedLevel, soundEnabled, speechRate }: StarPuzzleProps) {
  const [qIndex, setQIndex] = useState(0);
  // slots hold the fragment indices currently placed in slots [0, 1, 2, 3]
  const [slots, setSlots] = useState<(number | null)[]>([...EMPTY_SLOTS]);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { locale } = useLocale();

  const currentQ = pool[qIndex] || pool[0];
  const drillSi = currentQ && locale === "si" ? DRILL_SI[currentQ.id] : undefined;
  const allFilled = slots.every((s) => s !== null);

  const isStarCorrect = useMemo(() => {
    if (!currentQ || !allFilled) return false;
    return slots[currentQ.starSlotIndex] === currentQ.correctOrder[currentQ.starSlotIndex];
  }, [currentQ, slots, allFilled]);

  const isFullSentenceCorrect = useMemo(() => {
    if (!currentQ || !allFilled) return false;
    return slots.every((fragIdx, slotIdx) => fragIdx === currentQ.correctOrder[slotIdx]);
  }, [currentQ, slots, allFilled]);

  const handleSelectTile = (fragIdx: number) => {
    if (isChecked) return;
    const emptySlot = slots.findIndex((s) => s === null);
    if (emptySlot === -1) return;
    setSlots(slots.map((s, i) => (i === emptySlot ? fragIdx : s)));
    if (soundEnabled) playSfx("flip");
  };

  const handleRemoveSlot = (slotIdx: number) => {
    if (isChecked || slots[slotIdx] === null) return;
    setSlots(slots.map((s, i) => (i === slotIdx ? null : s)));
    if (soundEnabled) playSfx("flip");
  };

  const handleResetSlots = () => {
    if (isChecked) return;
    setSlots([...EMPTY_SLOTS]);
  };

  const handleCheck = () => {
    if (!allFilled || isChecked || !currentQ) return;
    setIsChecked(true);
    setTotalAttempts((prev) => prev + 1);
    if (isStarCorrect) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx(isFullSentenceCorrect ? "streak" : "correct");
    } else if (soundEnabled) {
      playSfx("wrong");
    }
    // Pronounce the correct full sentence so the learner hears the natural flow
    speakJapanese(currentQ.fullSentence, { rate: speechRate });
  };

  const handleNext = () => {
    setSlots([...EMPTY_SLOTS]);
    setIsChecked(false);
    setQIndex((prev) => (prev + 1) % pool.length);
  };

  const handleRestart = () => {
    setSlots([...EMPTY_SLOTS]);
    setIsChecked(false);
    setQIndex(0);
    setScore(0);
    setTotalAttempts(0);
  };

  if (!currentQ) {
    return (
      <EmptyState
        icon={Star}
        title="No sentence-order puzzles yet"
        description={`There are no ${selectedLevel} sentence-order puzzles. Try another level or the particle drill.`}
      />
    );
  }

  const starTile = currentQ.fragments[currentQ.correctOrder[currentQ.starSlotIndex]];

  return (
    <DrillCard>
      <DrillProgress
        label="Puzzle"
        current={qIndex + 1}
        total={pool.length}
        meta={`Score ${score}/${totalAttempts}`}
      />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-jp">文の組み立て</Badge>
          <Badge variant="outline">{currentQ.category}</Badge>
        </div>
        <h3 className="pt-1 font-semibold tracking-tight">Put the four pieces in order. Which one goes on the ★?</h3>
        <p className="text-sm text-muted-foreground">Tap a piece to place it. Tap a placed piece to take it back.</p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex flex-wrap items-center justify-center gap-2 font-jp text-base sm:text-lg">
          {currentQ.sentenceBefore ? <span>{currentQ.sentenceBefore}</span> : null}
          {[0, 1, 2, 3].map((slotIdx) => {
            const isStar = slotIdx === currentQ.starSlotIndex;
            const fragIdx = slots[slotIdx];
            const hasFrag = fragIdx !== null;
            const checkedStar = isChecked && isStar && hasFrag;
            return (
              <Button
                key={slotIdx}
                type="button"
                variant="outline"
                onClick={() => handleRemoveSlot(slotIdx)}
                disabled={isChecked || !hasFrag}
                aria-label={
                  hasFrag
                    ? `Slot ${slotIdx + 1}${isStar ? " (star)" : ""}: ${currentQ.fragments[fragIdx]}. Tap to remove.`
                    : `Empty slot ${slotIdx + 1}${isStar ? " (star)" : ""}`
                }
                className={cn(
                  "h-auto min-h-11 min-w-16 gap-1 px-3 py-2 font-jp text-base whitespace-normal disabled:opacity-100",
                  !hasFrag && "border-dashed text-muted-foreground",
                  hasFrag && !checkedStar && "border-primary bg-primary/10",
                  isStar && !hasFrag && "border-primary/60",
                  checkedStar && (isStarCorrect ? "border-chart-3 bg-chart-3/10" : "border-destructive bg-destructive/10")
                )}
              >
                {isStar ? <Star className="size-3.5 fill-primary text-primary" /> : null}
                {hasFrag ? currentQ.fragments[fragIdx] : <span className="font-mono text-xs">{slotIdx + 1}</span>}
              </Button>
            );
          })}
          {currentQ.sentenceAfter ? <span>{currentQ.sentenceAfter}</span> : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Pieces</p>
          {!isChecked && slots.some((s) => s !== null) ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleResetSlots}>
              <RotateCcw /> Clear
            </Button>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {currentQ.fragments.map((frag, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              disabled={slots.includes(idx) || isChecked}
              onClick={() => handleSelectTile(idx)}
              className="h-auto min-h-11 justify-between gap-2 py-2 text-left font-jp text-base whitespace-normal"
            >
              <span className="min-w-0 break-words">{frag}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{idx + 1}</span>
            </Button>
          ))}
        </div>
      </div>

      {isChecked ? (
        <div className="space-y-3">
          <FeedbackBanner
            correct={isStarCorrect}
            title={
              isStarCorrect
                ? isFullSentenceCorrect
                  ? "Correct. The whole sentence is in the right order."
                  : "Correct. The ★ piece is right."
                : "Not quite."
            }
          >
            The ★ piece is <span className="font-jp font-medium text-foreground">{starTile}</span>.
          </FeedbackBanner>

          <ExplanationBlock
            title={<span className="font-jp">{currentQ.grammarPoint}</span>}
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => speakJapanese(currentQ.fullSentence, { rate: speechRate })}
              >
                <Volume2 /> Listen
              </Button>
            }
          >
            <p className="font-jp text-base leading-relaxed">{currentQ.fullSentence}</p>
            <p className="text-muted-foreground">{drillSi?.english ?? lessonText(locale, currentQ.english)}</p>
            {locale === "si" ? <p className="text-xs text-muted-foreground">{currentQ.english}</p> : null}
            <p className="border-t pt-2 leading-relaxed text-muted-foreground">
              {drillSi?.explanation ?? lessonText(locale, currentQ.explanation)}
            </p>
          </ExplanationBlock>
        </div>
      ) : null}

      <DrillFooter
        start={
          <Button type="button" variant="ghost" onClick={handleRestart}>
            <RotateCcw /> Restart
          </Button>
        }
        end={
          isChecked ? (
            <Button type="button" onClick={handleNext}>
              Next puzzle <ArrowRight />
            </Button>
          ) : (
            <Button type="button" onClick={handleCheck} disabled={!allFilled}>
              <CheckCircle2 /> Check
            </Button>
          )
        }
      />
    </DrillCard>
  );
}
