"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Headphones, RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import type { JLPTWord } from "@/data/vocab-n5";
import { englishChoices } from "@/data/level-words";
import { playSfx, speakJapanese } from "@/lib/audio";
import { lessonText } from "@/lib/i18n/content-si";
import {
  AnswerOption,
  DrillCard,
  DrillFooter,
  DrillProgress,
  FeedbackBanner,
  optionState,
} from "./drill-ui";

const SLOW_RATE = 0.7;

type WordQuizProps = {
  wordPool: JLPTWord[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

/** Hear a word without seeing it, then pick its meaning. */
export function ListeningWords({ wordPool, selectedLevel, soundEnabled, speechRate }: WordQuizProps) {
  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const { locale } = useLocale();

  const nextQuestion = useCallback(() => {
    if (wordPool.length === 0) return;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    setCurrentWord(word);
    setOptions(englishChoices(word, wordPool, 4));
    setSelectedAnswer(null);
    setIsRevealed(false);
    setTimeout(() => {
      speakJapanese(word.kanji || word.hiragana, { rate: speechRate });
    }, 150);
  }, [wordPool, speechRate]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handleSelect = (chosen: string) => {
    if (selectedAnswer !== null || !currentWord) return;
    setSelectedAnswer(chosen);
    setIsRevealed(true);
    setTotalQuestions((prev) => prev + 1);
    if (chosen === currentWord.english) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else if (soundEnabled) {
      playSfx("wrong");
    }
  };

  const handleRestart = () => {
    setScore(0);
    setTotalQuestions(0);
    nextQuestion();
  };

  if (wordPool.length === 0) {
    return (
      <EmptyState
        icon={Headphones}
        title="No words yet"
        description={`There are no ${selectedLevel} words to listen to.`}
      />
    );
  }

  const speak = (rate: number) => {
    if (currentWord) speakJapanese(currentWord.kanji || currentWord.hiragana, { rate });
  };
  const isCorrect = currentWord !== null && selectedAnswer === currentWord.english;

  return (
    <DrillCard>
      <DrillProgress label="Correct" current={score} total={totalQuestions} />

      <div className="space-y-1">
        <Badge variant="secondary" className="font-jp">単語</Badge>
        <h3 className="pt-1 font-semibold tracking-tight">Listen to the word, then choose its meaning.</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => speak(speechRate)} disabled={!currentWord}>
          <Volume2 /> Play again
        </Button>
        <Button type="button" variant="outline" onClick={() => speak(SLOW_RATE)} disabled={!currentWord}>
          <Volume2 /> Slower
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, idx) => (
          <AnswerOption
            key={`${option}-${idx}`}
            state={optionState(
              selectedAnswer !== null,
              selectedAnswer === option,
              currentWord !== null && option === currentWord.english
            )}
            disabled={selectedAnswer !== null}
            onClick={() => handleSelect(option)}
          >
            {lessonText(locale, option)}
          </AnswerOption>
        ))}
      </div>

      {isRevealed && currentWord ? (
        <FeedbackBanner correct={isCorrect} title={isCorrect ? "Correct." : "Not quite."}>
          <span className="font-jp text-base text-foreground">{currentWord.kanji || currentWord.hiragana}</span>{" "}
          <span className="font-jp">{currentWord.hiragana}</span> ({currentWord.romaji}) · {currentWord.topic} ·{" "}
          {currentWord.partOfSpeech}
        </FeedbackBanner>
      ) : null}

      <DrillFooter
        start={
          <Button type="button" variant="ghost" onClick={handleRestart}>
            <RotateCcw /> Restart
          </Button>
        }
        end={
          <Button type="button" onClick={nextQuestion} disabled={!isRevealed}>
            Next word <ArrowRight />
          </Button>
        }
      />
    </DrillCard>
  );
}
