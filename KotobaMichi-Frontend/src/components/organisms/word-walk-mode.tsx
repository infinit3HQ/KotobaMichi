"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import type { JLPTWord } from "@/data/vocab-n5";
import { topicCountsForLevel, wordsForLevel, wordsForTopic } from "@/data/level-words";
import type { JLPTLevel } from "@/data/grammar";
import { playSfx, speakJapanese } from "@/lib/audio";
import { useLocale } from "@/components/organisms/locale-provider";
import { sinhalaWordGloss } from "@/lib/i18n/content-si";
import { CheckCircle2, Eye, EyeOff, Repeat, RotateCcw, Volume2, XCircle } from "lucide-react";

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
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3.5 bg-orange-500/10 text-orange-600 rounded-full w-fit mb-2">
            <Repeat className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Word Walk</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Pick a topic. Each word gives you meaning cards to choose from, and the set runs through with no timer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 max-w-lg mx-auto">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Choose Topic Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={selectedTopic === "All" ? "default" : "outline"}
                size="sm"
                className="text-xs rounded-full h-7"
                onClick={() => onSelectTopic("All")}
              >
                All Topics ({levelWords.length})
              </Button>
              {topics.map(({ topic, count }) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  className="text-xs rounded-full h-7"
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic} ({count})
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50 border text-center">
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-lg font-bold">None</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Words</div>
              <div className="text-lg font-bold">{wordPool.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Choices</div>
              <div className="text-lg font-bold">Keys 1–4</div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-base font-semibold gap-2 shadow-sm"
            onClick={startWalk}
            disabled={wordPool.length === 0}
          >
            <Repeat className="h-5 w-5" />
            Start Word Walk
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    const accuracy = order.length > 0 ? Math.round((correctCount / order.length) * 100) : 0;
    return (
      <Card className="border-2 border-primary/20 max-w-lg mx-auto text-center shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Walk complete</CardTitle>
          <CardDescription>
            {correctCount} of {order.length} correct ({accuracy}%).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => setStarted(false)}>
            Change selection
          </Button>
          <Button className="flex-1 gap-2" onClick={startWalk}>
            <RotateCcw className="h-4 w-4" />
            Walk again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card shadow-xs">
        <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/40">
          {selectedLevel}
          {selectedTopic !== "All" ? ` · ${selectedTopic}` : ""}
        </Badge>
        <span className="text-sm font-mono font-bold">
          {index + 1} / {order.length}
        </span>
        <button
          type="button"
          onClick={() => setStarted(false)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Change selection
        </button>
      </div>

      <Card className="border-2 shadow-md relative overflow-hidden">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="space-y-1">
            {showFurigana && current.kanji && current.kanji !== current.hiragana && (
              <div className="text-sm font-medium text-primary tracking-wide">{current.hiragana}</div>
            )}
            <div className="font-jp text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {current.kanji || current.hiragana}
            </div>
            <div className="text-xs text-muted-foreground font-mono">{current.romaji}</div>
          </div>

          <div className="flex justify-center items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => speak(current.kanji || current.hiragana)}
              className="gap-1.5 text-xs rounded-full"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              Listen <span className="opacity-50 text-[10px]">(R)</span>
            </Button>
            {current.kanji && current.kanji !== current.hiragana && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFurigana((open) => !open)}
                className="gap-1.5 text-xs text-muted-foreground rounded-full"
              >
                {showFurigana ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showFurigana ? "Hide Furigana" : "Furigana"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
            {choices.map((choice, idx) => {
              const isSelected = pickedId === choice.id;
              const isCorrect = choice.id === current.id;
              let variantClass = "border-border/80 hover:border-primary/50 hover:bg-muted/30";
              if (pickedId !== null) {
                if (isCorrect) {
                  variantClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold";
                } else if (isSelected) {
                  variantClass = "border-destructive bg-destructive/10 text-destructive";
                } else {
                  variantClass = "opacity-40";
                }
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={pickedId !== null}
                  onClick={() => choose(choice)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${variantClass}`}
                >
                  <span className="font-medium text-sm leading-snug flex items-center gap-2">
                    {pickedId !== null && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {pickedId !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                    {gloss(choice)}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 ml-2">
                    {idx + 1}
                  </span>
              </button>
            );
            })}
          </div>

          {pickedId !== null && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Correct answer
                </div>
                <div className="mt-1 text-base font-semibold leading-snug">{gloss(current)}</div>
              </div>
              <Button type="button" size="lg" className="w-full" onClick={continueWalk}>
                {index + 1 >= order.length ? "See results" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
