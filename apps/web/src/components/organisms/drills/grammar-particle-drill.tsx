"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel, ParticleClozeQuestion } from "@/data/grammar";
import { playSfx, speakJapanese } from "@/lib/audio";
import { DRILL_SI, lessonText } from "@/lib/i18n/content-si";
import { cn } from "@/lib/utils";
import {
  AnswerOption,
  DrillCard,
  DrillFooter,
  DrillProgress,
  ExplanationBlock,
  FeedbackBanner,
  optionState,
} from "./drill-ui";

type ParticleDrillProps = {
  pool: ParticleClozeQuestion[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

/** 助詞: pick the particle that fills the blank. */
export function GrammarParticleDrill({ pool, selectedLevel, soundEnabled, speechRate }: ParticleDrillProps) {
  const [qIndex, setQIndex] = useState(0);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { locale } = useLocale();

  const currentQ = pool[qIndex] || pool[0];
  const drillSi = currentQ && locale === "si" ? DRILL_SI[currentQ.id] : undefined;

  const handleSelect = (choice: string) => {
    if (selectedParticle !== null || !currentQ) return;
    setSelectedParticle(choice);
    setTotalAttempts((prev) => prev + 1);
    if (choice === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else if (soundEnabled) {
      playSfx("wrong");
    }
    speakJapanese(currentQ.fullSentence, { rate: speechRate });
  };

  const handleNext = () => {
    setSelectedParticle(null);
    setQIndex((prev) => (prev + 1) % pool.length);
  };

  const handleRestart = () => {
    setSelectedParticle(null);
    setQIndex(0);
    setScore(0);
    setTotalAttempts(0);
  };

  if (!currentQ) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No particle questions yet"
        description={`There are no ${selectedLevel} particle questions. Try another level or the sentence-order puzzle.`}
      />
    );
  }

  const isAnswered = selectedParticle !== null;
  const isCorrect = selectedParticle === currentQ.correctAnswer;

  return (
    <DrillCard>
      <DrillProgress
        label="Question"
        current={qIndex + 1}
        total={pool.length}
        meta={`Score ${score}/${totalAttempts}`}
      />

      <div className="space-y-1">
        <Badge variant="secondary" className="font-jp">助詞</Badge>
        <h3 className="pt-1 font-semibold tracking-tight">Choose the particle for the blank.</h3>
      </div>

      <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-center">
        <p className="flex flex-wrap items-center justify-center gap-1.5 font-jp text-lg leading-relaxed sm:text-xl">
          <span>{currentQ.sentenceBefore}</span>
          <span
            className={cn(
              "inline-flex h-9 min-w-11 items-center justify-center rounded-md border px-2 font-medium",
              !isAnswered && "border-dashed border-primary/60 text-primary",
              isAnswered && isCorrect && "border-chart-3 bg-chart-3/10",
              isAnswered && !isCorrect && "border-destructive bg-destructive/10"
            )}
          >
            {selectedParticle || "?"}
          </span>
          <span>{currentQ.sentenceAfter}</span>
        </p>
        <p className="text-sm text-muted-foreground">{drillSi?.english ?? lessonText(locale, currentQ.english)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {currentQ.options.map((opt, idx) => (
          <AnswerOption
            key={`${opt}-${idx}`}
            align="center"
            state={optionState(isAnswered, selectedParticle === opt, opt === currentQ.correctAnswer)}
            disabled={isAnswered}
            onClick={() => handleSelect(opt)}
            className="font-jp text-lg"
          >
            {opt}
          </AnswerOption>
        ))}
      </div>

      {isAnswered ? (
        <div className="space-y-3">
          <FeedbackBanner
            correct={isCorrect}
            title={isCorrect ? "Correct." : `Not quite. The answer is ${currentQ.correctAnswer}.`}
          />
          <ExplanationBlock
            title="Why"
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
            <p className="leading-relaxed text-muted-foreground">
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
          <Button type="button" onClick={handleNext} disabled={!isAnswered}>
            Next question <ArrowRight />
          </Button>
        }
      />
    </DrillCard>
  );
}
