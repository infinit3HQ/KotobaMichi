"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { JLPT_N5_WORDS, JLPT_TOPICS } from "@/data/vocab-n5";
import { getTanosWordsByLevel } from "@/data/vocab-tanos";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese } from "@/lib/audio";
import { useLocale } from "@/components/organisms/locale-provider";
import { sinhalaWordGloss } from "@/lib/i18n/content-si";
import { ChevronLeft, ChevronRight, Repeat, Volume2 } from "lucide-react";

interface WordWalkModeProps {
  selectedLevel: JLPTLevel;
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  soundEnabled: boolean;
  speechRate: number;
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
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const topicByHiragana = useMemo(() => {
    const map = new Map<string, string>();
    for (const word of JLPT_N5_WORDS) {
      if (word.topic) map.set(word.hiragana, word.topic);
    }
    return map;
  }, []);

  const levelWords = useMemo(() => {
    return getTanosWordsByLevel(selectedLevel).map((word) => ({
      ...word,
      topic: topicByHiragana.get(word.hiragana) || word.topic || "General",
    }));
  }, [selectedLevel, topicByHiragana]);

  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const word of levelWords) {
      if (!word.topic || word.topic === "General") continue;
      counts.set(word.topic, (counts.get(word.topic) ?? 0) + 1);
    }
    return counts;
  }, [levelWords]);

  const topics = useMemo(() => {
    const known = JLPT_TOPICS.filter((topic) => (topicCounts.get(topic) ?? 0) > 0);
    const extra = [...topicCounts.keys()].filter((topic) => !known.includes(topic)).sort();
    return [...known, ...extra];
  }, [topicCounts]);

  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return levelWords;
    return levelWords.filter((word) => word.topic === selectedTopic);
  }, [levelWords, selectedTopic]);

  useEffect(() => {
    setStarted(false);
    setIndex(0);
    setRevealed(false);
  }, [selectedLevel, selectedTopic]);

  const safeIndex = wordPool.length === 0 ? 0 : index % wordPool.length;
  const word = wordPool[safeIndex] ?? null;

  const speak = useCallback(
    (text: string) => {
      void speakJapanese(text, { rate: speechRate });
    },
    [speechRate],
  );

  const go = useCallback(
    (direction: -1 | 1) => {
      if (wordPool.length === 0) return;
      setIndex((current) => (current + direction + wordPool.length) % wordPool.length);
      setRevealed(false);
    },
    [wordPool.length],
  );

  useEffect(() => {
    if (!started || !word || !soundEnabled) return;
    speak(word.kanji || word.hiragana);
  }, [started, word, soundEnabled, speak]);

  useEffect(() => {
    if (!started) return;
    const onKey = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === " ") {
        event.preventDefault();
        setRevealed((open) => !open);
      } else if (event.key.toLowerCase() === "r" && word) {
        speak(word.kanji || word.hiragana);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, go, speak, word]);

  const startWalk = () => {
    setIndex(0);
    setRevealed(false);
    setStarted(true);
  };

  if (!started) {
    return (
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3.5 bg-orange-500/10 text-orange-600 rounded-full w-fit mb-2">
            <Repeat className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Word Walk</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Pick a topic, then move through every word in that selection. There is no timer.
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
              {topics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  className="text-xs rounded-full h-7"
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic} ({topicCounts.get(topic) ?? 0})
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
              <div className="text-xs text-muted-foreground">Order</div>
              <div className="text-lg font-bold">1 by 1</div>
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

  if (!word) {
    return (
      <Card className="max-w-xl mx-auto p-8 text-center text-muted-foreground">
        No words in this selection.
      </Card>
    );
  }

  const meaning = locale === "si" ? (sinhalaWordGloss(word) ?? word.english) : word.english;
  const showEnglishToo = locale === "si" && meaning !== word.english;

  return (
    <Card className="max-w-xl mx-auto border-2 border-primary/20 shadow-sm">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/40">
            {selectedLevel}
            {selectedTopic !== "All" ? ` · ${selectedTopic}` : ""}
          </Badge>
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Change selection
          </button>
        </div>

        <div className="text-center space-y-2 min-h-[9.5rem] flex flex-col items-center justify-center">
          <p className="text-xs font-medium text-muted-foreground">
            {safeIndex + 1} / {wordPool.length}
          </p>
          {word.kanji && word.kanji !== word.hiragana && (
            <p className="font-jp text-sm text-primary/80">{word.hiragana}</p>
          )}
          <p className="font-jp text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            {word.kanji || word.hiragana}
          </p>
          {word.romaji && (
            <p className="text-sm font-mono text-muted-foreground">{word.romaji}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setRevealed((open) => !open)}
          className="w-full rounded-2xl border bg-muted/40 px-4 py-5 text-center transition-colors hover:bg-muted/70"
        >
          {revealed ? (
            <span className="block space-y-1">
              <span className="block text-xl font-bold text-foreground">{meaning}</span>
              {showEnglishToo && (
                <span className="block text-sm text-muted-foreground">{word.english}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Tap to reveal the meaning</span>
          )}
        </button>

        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => go(-1)} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => speak(word.kanji || word.hiragana)}
            title="Play pronunciation"
          >
            <Volume2 className="h-4 w-4 text-primary" />
          </Button>
          <Button type="button" onClick={() => go(1)} className="gap-1.5">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
