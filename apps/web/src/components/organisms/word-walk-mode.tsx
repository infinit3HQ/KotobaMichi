"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import type { JLPTWord } from "@/data/vocab-n5";
import { topicCountsForLevel, wordsForLevel, wordsForTopic } from "@/data/level-words";
import type { JLPTLevel } from "@/data/grammar";
import { playSfx, speakJapanese } from "@/lib/audio";
import { useLocale } from "@/components/organisms/locale-provider";
import { sinhalaWordGloss } from "@/lib/i18n/content-si";
import { Repeat, RotateCcw } from "lucide-react";
import {
  AnswerFeedback,
  AnswerOption,
  StatRow,
  TopicSelect,
  WordPrompt,
  answerState,
} from "@/components/organisms/practice/drill-parts";

interface WordWalkModeProps {
  selectedLevel: JLPTLevel;
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  soundEnabled: boolean;
  speechRate: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function WordWalkMode({
  selectedLevel,
  selectedTopic,
  onSelectTopic,
  soundEnabled,
  speechRate,
}: WordWalkModeProps) {
  const { locale } = useLocale();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFurigana, setShowFurigana] = useState(false);
  const [order, setOrder] = useState<JLPTWord[]>([]);
  const [choices, setChoices] = useState<JLPTWord[]>([]);

  const gloss = useCallback(
    (word: JLPTWord) => (locale === "si" ? (sinhalaWordGloss(word) ?? word.english) : word.english),
    [locale],
  );

  const levelWords = useMemo(() => wordsForLevel(selectedLevel), [selectedLevel]);
  const topics = useMemo(() => topicCountsForLevel(selectedLevel), [selectedLevel]);
  const wordPool = useMemo(() => wordsForTopic(selectedLevel, selectedTopic), [selectedLevel, selectedTopic]);

  const buildChoices = useCallback(
    (word: JLPTWord, pool: JLPTWord[]) => {
      const answer = gloss(word);
      const distractors = shuffle(
        pool.filter((item) => item.id !== word.id && gloss(item) !== answer),
      ).slice(0, 3);
      return shuffle([word, ...distractors]);
    },
    [gloss],
  );

  useEffect(() => {
    setStarted(false);
    setFinished(false);
    setIndex(0);
    setPickedId(null);
    setCorrectCount(0);
  }, [selectedLevel, selectedTopic]);

  const current = order[index] ?? null;

  const speak = useCallback(
    (text: string) => {
      void speakJapanese(text, { rate: speechRate });
    },
    [speechRate],
  );

  useEffect(() => {
    if (!started || finished || !current || !soundEnabled) return;
    speak(current.kanji || current.hiragana);
  }, [started, finished, current, soundEnabled, speak]);

  const startWalk = () => {
    if (wordPool.length === 0) return;
    const nextOrder = [...wordPool];
    setOrder(nextOrder);
    setChoices(buildChoices(nextOrder[0], nextOrder));
    setIndex(0);
    setPickedId(null);
    setCorrectCount(0);
    setFinished(false);
    setStarted(true);
  };

  const goNext = useCallback(
    (fromIndex: number, deck: JLPTWord[]) => {
      const next = fromIndex + 1;
      if (next >= deck.length) {
        setFinished(true);
        return;
      }
      setIndex(next);
      setPickedId(null);
      setChoices(buildChoices(deck[next], deck));
    },
    [buildChoices],
  );

  const choose = useCallback(
    (choice: JLPTWord) => {
      if (!current || pickedId !== null) return;
      setPickedId(choice.id);
      const correct = choice.id === current.id;
      if (correct) setCorrectCount((count) => count + 1);
      if (soundEnabled) playSfx(correct ? "correct" : "wrong");
    },
    [current, pickedId, soundEnabled],
  );

  const continueWalk = useCallback(() => {
    if (pickedId === null) return;
    goNext(index, order);
  }, [pickedId, goNext, index, order]);

  useEffect(() => {
    if (!started || finished) return;
    const onKey = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (pickedId !== null && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        continueWalk();
        return;
      }
      if (pickedId !== null) return;
      if (["1", "2", "3", "4"].includes(event.key)) {
        const choice = choices[Number(event.key) - 1];
        if (choice) choose(choice);
      } else if (event.key.toLowerCase() === "r" && current) {
        speak(current.kanji || current.hiragana);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, finished, choices, choose, continueWalk, current, pickedId, speak]);

  if (!started) {
    return (
      <Card className="mx-auto w-full max-w-xl gap-5 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg tracking-tight">Walk through a topic</CardTitle>
          <CardDescription>
            Go through every word in a topic and pick its meaning from four choices. There is no timer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <TopicSelect
            value={selectedTopic}
            onValueChange={onSelectTopic}
            allLabel="All topics"
            allCount={levelWords.length}
            topics={topics}
          />
          <StatRow
            items={[
              { label: "Time", value: "None" },
              { label: "Words", value: wordPool.length },
              { label: "Choices", value: 4 },
            ]}
          />
          <Button size="lg" className="w-full" onClick={startWalk} disabled={wordPool.length === 0}>
            <Repeat />
            Start walk
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    const accuracy = order.length > 0 ? Math.round((correctCount / order.length) * 100) : 0;
    return (
      <Card className="mx-auto w-full max-w-xl gap-5 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg tracking-tight">Walk complete</CardTitle>
          <CardDescription>
            {correctCount} of {order.length} correct.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <StatRow
            items={[
              { label: "Correct", value: correctCount },
              { label: "Words", value: order.length },
              { label: "Accuracy", value: `${accuracy}%` },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setStarted(false)}>
              Change topic
            </Button>
            <Button className="sm:flex-1" onClick={startWalk}>
              <RotateCcw />
              Walk again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  const answered = pickedId !== null;
  const hasReading = Boolean(current.kanji && current.kanji !== current.hiragana);

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {selectedLevel}
            {selectedTopic !== "All" ? ` · ${selectedTopic}` : ""}
            <span className="mx-1.5" aria-hidden>·</span>
            <span className="font-mono tabular-nums text-foreground">
              {index + 1} / {order.length}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>
            Change topic
          </Button>
        </div>
        <Progress value={(index / Math.max(order.length, 1)) * 100} aria-label={`Word ${index + 1} of ${order.length}`} className="h-1.5" />
      </div>

      <Card className="gap-5 py-5 sm:py-6">
        <CardContent className="space-y-5 px-4 sm:px-6">
          <WordPrompt
            text={current.kanji || current.hiragana}
            reading={hasReading ? current.hiragana : null}
            romaji={current.romaji}
            showReading={showFurigana}
            onToggleReading={() => setShowFurigana((open) => !open)}
            onListen={() => speak(current.kanji || current.hiragana)}
          />

          <div className="grid gap-2 sm:grid-cols-2">
            {choices.map((choice, idx) => (
              <AnswerOption
                key={choice.id}
                index={idx}
                disabled={answered}
                state={answerState(answered, choice.id === current.id, pickedId === choice.id)}
                onSelect={() => choose(choice)}
              >
                {gloss(choice)}
              </AnswerOption>
            ))}
          </div>

          {answered && (
            <AnswerFeedback
              correct={pickedId === current.id}
              answer={gloss(current)}
              nextLabel={index + 1 >= order.length ? "See results" : "Next"}
              onNext={continueWalk}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
