"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Puzzle, RotateCcw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import type { KanjiMasterItem } from "@/data/kanji-master";
import { playSfx, speakJapanese } from "@/lib/audio";
import { kanjiMeaningText, lessonText, radicalMeaningText } from "@/lib/i18n/content-si";
import {
  AnswerOption,
  DrillCard,
  DrillFooter,
  DrillProgress,
  ExplanationBlock,
  FeedbackBanner,
  type OptionState,
} from "./drill-ui";

type RadicalPuzzleProps = {
  pool: KanjiMasterItem[];
  soundEnabled: boolean;
  speechRate: number;
  selectedLevel: JLPTLevel;
};

/** Correct radicals plus up to four distractors from other kanji, in a stable order. */
function buildOptionBank(current: KanjiMasterItem | undefined, pool: KanjiMasterItem[]): string[] {
  if (!current) return [];
  const correct = current.radicals.map((r) => r.character);
  const distractors: string[] = [];
  for (const other of pool) {
    if (other.id === current.id) continue;
    for (const r of other.radicals) {
      if (!correct.includes(r.character) && !distractors.includes(r.character)) {
        distractors.push(r.character);
        if (distractors.length >= 4) break;
      }
    }
    if (distractors.length >= 4) break;
  }
  return [...correct, ...distractors].sort();
}

function radicalState(
  rad: string,
  isAnswered: boolean,
  isSelected: boolean,
  correctChars: string[]
): OptionState {
  const isPart = correctChars.includes(rad);
  if (!isAnswered) return isSelected ? "selected" : "idle";
  if (isPart) return "correct";
  return isSelected ? "incorrect" : "muted";
}

/** 部首: pick the parts that make up a kanji. */
export function KanjiRadicalPuzzle({ pool, soundEnabled, speechRate, selectedLevel }: RadicalPuzzleProps) {
  // Only kanji with two or more radicals make a puzzle
  const puzzlePool = useMemo(() => pool.filter((k) => k.radicals && k.radicals.length >= 2), [pool]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRadicals, setSelectedRadicals] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const { locale } = useLocale();

  const currentKanji = puzzlePool[currentIndex % (puzzlePool.length || 1)];
  const optionBank = useMemo(() => buildOptionBank(currentKanji, pool), [currentKanji, pool]);

  const handleToggleRadical = (radChar: string) => {
    if (isAnswered) return;
    setSelectedRadicals((prev) =>
      prev.includes(radChar) ? prev.filter((r) => r !== radChar) : [...prev, radChar]
    );
  };

  const handleVerify = () => {
    if (!currentKanji || selectedRadicals.length === 0) return;
    const correctChars = currentKanji.radicals.map((r) => r.character).sort();
    const userChars = [...selectedRadicals].sort();
    const correct =
      correctChars.length === userChars.length && correctChars.every((c, i) => c === userChars[i]);

    setIsCorrect(correct);
    setIsAnswered(true);
    setAttempts((prev) => prev + 1);
    if (correct) setScore((prev) => prev + 1);

    if (soundEnabled) {
      playSfx(correct ? "correct" : "wrong");
      if (correct) speakJapanese(currentKanji.character, { rate: speechRate });
    }
  };

  const resetAnswer = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedRadicals([]);
  };

  const handleNext = () => {
    resetAnswer();
    setCurrentIndex((prev) => (prev + 1) % puzzlePool.length);
  };

  const handleRestart = () => {
    resetAnswer();
    setCurrentIndex(0);
    setScore(0);
    setAttempts(0);
  };

  if (!currentKanji) {
    return (
      <EmptyState
        icon={Puzzle}
        title="No parts puzzles yet"
        description={`No ${selectedLevel} kanji have two or more parts to build from.`}
      />
    );
  }

  const correctChars = currentKanji.radicals.map((r) => r.character);

  return (
    <DrillCard className="mx-auto w-full max-w-2xl">
      <DrillProgress
        label="Kanji"
        current={(currentIndex % puzzlePool.length) + 1}
        total={puzzlePool.length}
        meta={`Score ${score}/${attempts}`}
      />

      <div className="space-y-1 text-center">
        <p className="font-jp text-5xl font-bold">{currentKanji.character}</p>
        <p className="text-sm text-muted-foreground">{kanjiMeaningText(locale, currentKanji)}</p>
        <h3 className="pt-2 font-semibold tracking-tight">
          Pick the {currentKanji.radicals.length} parts that make this kanji.
        </h3>
      </div>

      <div className="flex min-h-14 flex-wrap items-center justify-center gap-2 rounded-lg bg-muted/50 p-3">
        {selectedRadicals.length === 0 ? (
          <span className="text-sm text-muted-foreground">Your picks show up here</span>
        ) : (
          selectedRadicals.map((rad) => (
            <span
              key={rad}
              className="flex size-10 items-center justify-center rounded-md border bg-background font-jp text-xl font-semibold"
            >
              {rad}
            </span>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {optionBank.map((rad) => (
          <AnswerOption
            key={rad}
            align="center"
            state={radicalState(rad, isAnswered, selectedRadicals.includes(rad), correctChars)}
            disabled={isAnswered}
            onClick={() => handleToggleRadical(rad)}
            className="font-jp text-2xl"
          >
            {rad}
          </AnswerOption>
        ))}
      </div>

      {isAnswered ? (
        <div className="space-y-3">
          <FeedbackBanner correct={isCorrect} title={isCorrect ? "Correct." : "Not quite."}>
            <span className="font-jp">{currentKanji.character}</span> ={" "}
            {currentKanji.radicals
              .map((r) => `${r.character} (${radicalMeaningText(locale, r)})`)
              .join(" + ")}
          </FeedbackBanner>
          {currentKanji.mnemonic ? (
            <ExplanationBlock title="Memory hint">
              <p className="leading-relaxed text-muted-foreground">{lessonText(locale, currentKanji.mnemonic)}</p>
            </ExplanationBlock>
          ) : null}
        </div>
      ) : null}

      <DrillFooter
        start={
          <Button type="button" variant="ghost" onClick={handleRestart}>
            <RotateCcw /> Restart
          </Button>
        }
        end={
          isAnswered ? (
            <Button type="button" onClick={handleNext}>
              Next kanji <ArrowRight />
            </Button>
          ) : (
            <Button type="button" onClick={handleVerify} disabled={selectedRadicals.length === 0}>
              <CheckCircle2 /> Check
            </Button>
          )
        }
      />
    </DrillCard>
  );
}
