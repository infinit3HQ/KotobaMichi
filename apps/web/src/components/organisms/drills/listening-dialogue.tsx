"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Headphones, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import type { ListeningScenario } from "@/data/listening";
import { playSfx, speakDialogue, speakJapanese, stopSpeaking } from "@/lib/audio";
import { lessonText } from "@/lib/i18n/content-si";
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

const SLOW_RATE = 0.72;

type DialogueQuizProps = {
  scenarios: ListeningScenario[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

/** 課題理解: listen to a short conversation, then answer a question about it. */
export function ListeningDialogue({ scenarios, selectedLevel, soundEnabled, speechRate }: DialogueQuizProps) {
  const { locale } = useLocale();
  const [sIndex, setSIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const currentScenario = scenarios[sIndex] || scenarios[0];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [sIndex]);

  const handleStopAudio = () => {
    stopSpeaking();
    setIsPlaying(false);
    setActiveLine(null);
  };

  const handlePlayDialogue = async (speedRate?: number) => {
    if (!currentScenario) return;
    if (isPlaying) {
      handleStopAudio();
      return;
    }
    setIsPlaying(true);
    await speakDialogue(currentScenario.dialogue, {
      rate: speedRate ?? speechRate,
      onLineChange: (idx) => setActiveLine(idx),
      onEnd: () => {
        setIsPlaying(false);
        setActiveLine(null);
      },
    });
  };

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentScenario) return;
    setSelectedAnswer(index);
    setTotalAttempts((prev) => prev + 1);
    if (index === currentScenario.correctAnswerIndex) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else if (soundEnabled) {
      playSfx("wrong");
    }
  };

  const handleNext = () => {
    handleStopAudio();
    setSelectedAnswer(null);
    setShowScript(false);
    setSIndex((prev) => (prev + 1) % scenarios.length);
  };

  const handleRestart = () => {
    handleStopAudio();
    setSelectedAnswer(null);
    setShowScript(false);
    setSIndex(0);
    setScore(0);
    setTotalAttempts(0);
  };

  if (!currentScenario) {
    return (
      <EmptyState
        icon={Headphones}
        title="No conversations yet"
        description={`There are no ${selectedLevel} listening conversations. Try the word drill instead.`}
      />
    );
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentScenario.correctAnswerIndex;

  return (
    <DrillCard>
      <DrillProgress
        label="Conversation"
        current={sIndex + 1}
        total={scenarios.length}
        meta={`Score ${score}/${totalAttempts}`}
      />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-jp">聴解</Badge>
          <Badge variant="outline">{currentScenario.category}</Badge>
        </div>
        <h3 className="pt-1 font-semibold tracking-tight">{currentScenario.title}</h3>
      </div>

      <div className="space-y-1 rounded-lg bg-muted/50 p-4 text-sm">
        <p className="text-xs text-muted-foreground">Situation</p>
        <p className="font-jp text-base leading-relaxed">{currentScenario.situationJapanese}</p>
        <p className="text-muted-foreground">{lessonText(locale, currentScenario.situationEnglish)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isPlaying ? "secondary" : "default"}
          onClick={() => handlePlayDialogue()}
          aria-pressed={isPlaying}
        >
          {isPlaying ? <Square /> : <Play />}
          {isPlaying ? "Stop" : "Play conversation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handlePlayDialogue(SLOW_RATE)}
          disabled={isPlaying}
        >
          <Volume2 /> Slower
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {isPlaying ? "Playing…" : null}
        </span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="font-jp text-base leading-relaxed font-medium">{currentScenario.questionJapanese}</p>
          <p className="text-sm text-muted-foreground">{lessonText(locale, currentScenario.questionEnglish)}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {currentScenario.options.map((opt, idx) => (
            <AnswerOption
              key={idx}
              marker={idx + 1}
              state={optionState(isAnswered, selectedAnswer === idx, idx === currentScenario.correctAnswerIndex)}
              disabled={isAnswered}
              onClick={() => handleSelectAnswer(idx)}
              className="font-jp"
            >
              {lessonText(locale, opt)}
            </AnswerOption>
          ))}
        </div>
      </div>

      {isAnswered ? (
        <div className="space-y-3">
          <FeedbackBanner
            correct={isCorrect}
            title={isCorrect ? "Correct." : "Not quite. Read the clue and the transcript."}
          />
          <ExplanationBlock title="Clue">
            <p className="leading-relaxed text-muted-foreground">{lessonText(locale, currentScenario.explanation)}</p>
          </ExplanationBlock>
          {showScript ? (
            <Transcript scenario={currentScenario} activeLine={activeLine} speechRate={speechRate} />
          ) : null}
        </div>
      ) : null}

      <DrillFooter
        start={
          <>
            <Button type="button" variant="ghost" onClick={handleRestart}>
              <RotateCcw /> Restart
            </Button>
            {isAnswered ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScript((value) => !value)}
                aria-expanded={showScript}
              >
                {showScript ? <EyeOff /> : <Eye />}
                {showScript ? "Hide transcript" : "Transcript"}
              </Button>
            ) : null}
          </>
        }
        end={
          <Button type="button" onClick={handleNext} disabled={!isAnswered}>
            Next <ArrowRight />
          </Button>
        }
      />
    </DrillCard>
  );
}

function Transcript({
  scenario,
  activeLine,
  speechRate,
}: {
  scenario: ListeningScenario;
  activeLine: number | null;
  speechRate: number;
}) {
  const { locale } = useLocale();
  return (
    <div className="space-y-4 rounded-lg border p-3 sm:p-4">
      <ol className="space-y-2">
        {scenario.dialogue.map((line, idx) => (
          <li
            key={idx}
            className={cn(
              "flex items-start gap-3 rounded-md p-2 text-sm",
              activeLine === idx && "bg-primary/10"
            )}
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">{line.speaker}</p>
              <p className="font-jp text-base leading-relaxed">{line.japanese}</p>
              <p className="font-mono text-xs text-muted-foreground break-words">{line.romaji}</p>
              <p className="text-muted-foreground">{lessonText(locale, line.english)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => speakJapanese(line.japanese, { rate: speechRate })}
              aria-label="Listen to this line"
              className="shrink-0"
            >
              <Volume2 />
            </Button>
          </li>
        ))}
      </ol>

      {scenario.vocabulary.length > 0 ? (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Key words</p>
          <ul className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {scenario.vocabulary.map((vocab, idx) => (
              <li key={idx} className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-jp">
                  <span className="font-medium">{vocab.word}</span>{" "}
                  <span className="text-xs text-muted-foreground">{vocab.reading}</span>
                </span>
                <span className="text-muted-foreground">{lessonText(locale, vocab.meaning)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
