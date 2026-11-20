"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { ArrowRight, BookOpen, Languages, RotateCcw, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import type { JLPTLevel } from "@/data/grammar";
import { JLPT_READING_PASSAGES, type ReadingPassage as Passage, type ReadingQuestion } from "@/data/reading";
import { playSfx, speakJapanese, stopSpeaking } from "@/lib/audio";
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

type ReadingPassageProps = {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
};

/** 読解: a short passage, read aloud sentence by sentence, with comprehension questions. */
export function ReadingPassageDrill({ selectedLevel, soundEnabled, speechRate }: ReadingPassageProps) {
  const { locale } = useLocale();
  const [pIndex, setPIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  // questionId -> chosen option index
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const passages = JLPT_READING_PASSAGES.filter((p) => p.level === selectedLevel);
  const currentPassage = passages[pIndex] || passages[0];

  // Stop narration on unmount or passage switch
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [pIndex]);

  const handleNarratePassage = async () => {
    if (!currentPassage) return;
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
      setActiveSentence(null);
      return;
    }
    setIsNarrating(true);
    for (let i = 0; i < currentPassage.sentences.length; i++) {
      setActiveSentence(i);
      await speakJapanese(currentPassage.sentences[i], { rate: speechRate });
      await new Promise((res) => setTimeout(res, 350));
    }
    setIsNarrating(false);
    setActiveSentence(null);
  };

  const handleSpeakSentence = (sentence: string, index: number) => {
    stopSpeaking();
    setIsNarrating(false);
    setActiveSentence(index);
    speakJapanese(sentence, { rate: speechRate, onEnd: () => setActiveSentence(null) });
  };

  const handleAnswerQuestion = (qId: string, optIndex: number, correctIndex: number) => {
    if (answers[qId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    if (soundEnabled) playSfx(optIndex === correctIndex ? "correct" : "wrong");
  };

  const goToPassage = (index: number) => {
    stopSpeaking();
    setIsNarrating(false);
    setActiveSentence(null);
    setShowTranslation(false);
    setAnswers({});
    setPIndex(index);
  };

  if (!currentPassage) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No passages yet"
        description={`There are no ${selectedLevel} reading passages. Try sentence practice instead.`}
      />
    );
  }

  const answeredCount = currentPassage.questions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = currentPassage.questions.filter((q) => answers[q.id] === q.correctAnswerIndex).length;

  return (
    <div className="space-y-4">
      <DrillCard>
        <DrillProgress
          label="Passage"
          current={pIndex + 1}
          total={passages.length}
          meta={`${correctCount}/${answeredCount} correct`}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-jp">読解</Badge>
              <Badge variant="outline">{currentPassage.type}</Badge>
            </div>
            <h3 className="pt-1 font-jp text-lg font-semibold tracking-tight">{currentPassage.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isNarrating ? "secondary" : "outline"}
              size="sm"
              onClick={handleNarratePassage}
              aria-pressed={isNarrating}
            >
              {isNarrating ? <Square /> : <Volume2 />}
              {isNarrating ? "Stop" : "Read aloud"}
            </Button>
            <Button
              type="button"
              variant={showTranslation ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowTranslation((value) => !value)}
              aria-pressed={showTranslation}
            >
              <Languages /> Translation
            </Button>
          </div>
        </div>

        <PassageText
          sentences={currentPassage.sentences}
          activeSentence={activeSentence}
          onSpeak={handleSpeakSentence}
        />
        <p className="text-xs text-muted-foreground">Tap a sentence to hear it.</p>

        {showTranslation ? (
          <ExplanationBlock title="Translation">
            <p className="leading-relaxed text-muted-foreground">{lessonText(locale, currentPassage.contentEnglish)}</p>
          </ExplanationBlock>
        ) : null}

        <DrillFooter
          start={
            <Button type="button" variant="ghost" onClick={() => goToPassage(0)} disabled={pIndex === 0}>
              <RotateCcw /> Restart
            </Button>
          }
          end={
            passages.length > 1 ? (
              <Button type="button" variant="outline" onClick={() => goToPassage((pIndex + 1) % passages.length)}>
                Next passage <ArrowRight />
              </Button>
            ) : null
          }
        />
      </DrillCard>

      <QuestionsCard passage={currentPassage} answers={answers} onAnswer={handleAnswerQuestion} />
    </div>
  );
}

function PassageText({
  sentences,
  activeSentence,
  onSpeak,
}: {
  sentences: string[];
  activeSentence: number | null;
  onSpeak: (sentence: string, index: number) => void;
}) {
  const onKey = (event: KeyboardEvent<HTMLSpanElement>, sentence: string, idx: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSpeak(sentence, idx);
    }
  };

  return (
    <div lang="ja" className="font-jp text-base leading-loose break-words sm:text-lg">
      {sentences.map((sent, idx) => (
        <span
          key={idx}
          role="button"
          tabIndex={0}
          onClick={() => onSpeak(sent, idx)}
          onKeyDown={(event) => onKey(event, sent, idx)}
          className={cn(
            "cursor-pointer rounded px-0.5 transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
            activeSentence === idx && "bg-primary/10 hover:bg-primary/15"
          )}
        >
          {sent}
        </span>
      ))}
    </div>
  );
}

function QuestionsCard({
  passage,
  answers,
  onAnswer,
}: {
  passage: Passage;
  answers: Record<string, number>;
  onAnswer: (qId: string, optIndex: number, correctIndex: number) => void;
}) {
  if (passage.questions.length === 0) return null;
  return (
    <Card className="gap-0 py-0">
      <div className="space-y-5 p-4 sm:p-6">
        <h3 className="font-semibold tracking-tight">
          Questions <span className="text-sm font-normal text-muted-foreground">({passage.questions.length})</span>
        </h3>
        {passage.questions.map((q, idx) => (
          <div key={q.id} className="space-y-5">
            {idx > 0 ? <Separator /> : null}
            <QuestionBlock question={q} number={idx + 1} chosen={answers[q.id]} onAnswer={onAnswer} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuestionBlock({
  question,
  number,
  chosen,
  onAnswer,
}: {
  question: ReadingQuestion;
  number: number;
  chosen: number | undefined;
  onAnswer: (qId: string, optIndex: number, correctIndex: number) => void;
}) {
  const { locale } = useLocale();
  const isAnswered = chosen !== undefined;
  const isCorrect = chosen === question.correctAnswerIndex;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Question {number}</p>
        <p className="font-jp text-base leading-relaxed font-medium">{question.questionJapanese}</p>
        <p className="text-sm text-muted-foreground">{lessonText(locale, question.questionEnglish)}</p>
      </div>
      <div className="grid gap-2">
        {question.options.map((opt, optIdx) => (
          <AnswerOption
            key={optIdx}
            marker={optIdx + 1}
            state={optionState(isAnswered, chosen === optIdx, optIdx === question.correctAnswerIndex)}
            disabled={isAnswered}
            onClick={() => onAnswer(question.id, optIdx, question.correctAnswerIndex)}
            className="font-jp"
          >
            {lessonText(locale, opt)}
          </AnswerOption>
        ))}
      </div>
      {isAnswered ? (
        <FeedbackBanner correct={isCorrect} title={isCorrect ? "Correct." : "Not quite."}>
          {lessonText(locale, question.explanation)}
        </FeedbackBanner>
      ) : null}
    </div>
  );
}
