"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import type { JLPTWord } from "@/data/vocab-n5";
import { englishChoices, topicCountsForLevel, wordsForLevel, wordsForTopic } from "@/data/level-words";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese, playSfx } from "@/lib/audio";
import { useLocale } from "@/components/organisms/locale-provider";
import { lessonText } from "@/lib/i18n/content-si";
import { useLearning } from "@/hooks/use-learning";
import { CheckCircle2, Clock, Flame, RotateCcw, Volume2, XCircle, Zap } from "lucide-react";
import {
  AnswerFeedback,
  AnswerOption,
  StatRow,
  TopicSelect,
  WordPrompt,
  answerState,
} from "@/components/organisms/practice/drill-parts";
import { cn } from "@/lib/utils";

interface SpeedSprintModeProps {
  selectedLevel: JLPTLevel;
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  soundEnabled: boolean;
  speechRate: number;
}

export function SpeedSprintMode({
  selectedLevel,
  selectedTopic,
  onSelectTopic,
  soundEnabled,
  speechRate,
}: SpeedSprintModeProps) {
  const { locale } = useLocale();
  const { user, due, record, savePlace } = useLearning(selectedLevel);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [history, setHistory] = useState<{ word: JLPTWord; isCorrect: boolean }[]>([]);

  // Current Question
  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(false);

  const levelWords = useMemo(() => wordsForLevel(selectedLevel), [selectedLevel]);
  const topics = useMemo(() => topicCountsForLevel(selectedLevel), [selectedLevel]);
  const wordPool = useMemo(() => wordsForTopic(selectedLevel, selectedTopic), [selectedLevel, selectedTopic]);

  // Next Question Generator
  const generateQuestion = useCallback(() => {
    if (wordPool.length === 0) return;
    const dueWords = wordPool.filter((word) => due.includes(word.id));
    const pickDue = dueWords.length > 0 && Math.random() < 0.5;
    const source = pickDue ? dueWords : wordPool;
    const word = source[Math.floor(Math.random() * source.length)];
    const allOptions = englishChoices(word, levelWords, 4);

    setCurrentWord(word);
    setOptions(allOptions);
    setSelectedAnswer(null);

    // Pronounce word immediately for audio-visual binding
    speakJapanese(word.kanji || word.hiragana, { rate: speechRate });
  }, [wordPool, levelWords, speechRate, due]);

  // Start Game
  const startGame = () => {
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setHistory([]);
    setTimeLeft(60);
    setGameState("playing");
    if (user) {
      void savePlace({ level: selectedLevel, mode: "sprint", cursor: 0 }).catch(() => undefined);
    }
    generateQuestion();
    if (soundEnabled) playSfx("flip");
  };

  // Timer Countdown
  useEffect(() => {
    if (gameState !== "playing" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      setGameState("gameover");
      if (soundEnabled) playSfx("streak");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, soundEnabled, selectedAnswer]);

  // Answer handler
  const handleAnswer = useCallback(
    (chosen: string) => {
      if (selectedAnswer !== null || !currentWord) return;

      const correct = chosen === currentWord.english;
      setSelectedAnswer(chosen);

      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > highestStreak) setHighestStreak(newStreak);
        const streakBonus = Math.min(newStreak, 5) * 10;
        setScore((prev) => prev + 100 + streakBonus);

        if (soundEnabled) {
          if (newStreak % 5 === 0) {
            playSfx("streak");
          } else {
            playSfx("correct");
          }
        }
      } else {
        setStreak(0);
        if (soundEnabled) playSfx("wrong");
      }

      setHistory((prev) => [{ word: currentWord, isCorrect: correct }, ...prev]);
      // Guests are recorded too; their reviews sync after sign-in.
      void record(currentWord.id, selectedLevel, correct ? "good" : "again").catch(() => undefined);
    },
    [currentWord, selectedAnswer, streak, highestStreak, soundEnabled, record, selectedLevel]
  );

  // Keyboard Navigation: keys 1, 2, 3, 4 and R for repeat
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedAnswer !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        generateQuestion();
        return;
      }
      if (selectedAnswer !== null) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (options[idx]) {
          handleAnswer(options[idx]);
        }
      } else if (e.key.toLowerCase() === "r" && currentWord) {
        speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, options, handleAnswer, currentWord, speechRate, selectedAnswer, generateQuestion]);

  if (gameState === "idle") {
    return (
      <Card className="mx-auto w-full max-w-xl gap-5 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg tracking-tight">60-second word sprint</CardTitle>
          <CardDescription>
            Hear a word and pick its meaning before the clock runs out. Each correct answer in a row adds a bonus.
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
              { label: "Time", value: "60s" },
              { label: "Words", value: wordPool.length },
              { label: "Choices", value: 4 },
            ]}
          />
          <Button size="lg" className="w-full" onClick={startGame} disabled={wordPool.length === 0}>
            <Zap />
            Start sprint
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === "gameover") {
    const accuracy = history.length > 0 ? Math.round((history.filter((h) => h.isCorrect).length / history.length) * 100) : 0;

    return (
      <Card className="mx-auto w-full max-w-xl gap-5 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg tracking-tight">Sprint finished</CardTitle>
          <CardDescription>
            You answered {history.length} {history.length === 1 ? "word" : "words"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <StatRow
            items={[
              { label: "Score", value: score },
              { label: "Best streak", value: highestStreak },
              { label: "Accuracy", value: `${accuracy}%` },
            ]}
          />

          {history.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Words practised</p>
              <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
                      item.isCorrect ? "bg-chart-3/10" : "bg-destructive/10"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {item.isCorrect ? (
                        <CheckCircle2 className="size-4 shrink-0 text-chart-3" aria-label="Correct" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-destructive" aria-label="Wrong" />
                      )}
                      <span lang="ja" className="font-jp font-medium">{item.word.kanji || item.word.hiragana}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {lessonText(locale, item.word.english)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label="Listen"
                      onClick={() => speakJapanese(item.word.kanji || item.word.hiragana, { rate: speechRate })}
                    >
                      <Volume2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setGameState("idle")}>
              Change topic
            </Button>
            <Button className="sm:flex-1" onClick={startGame}>
              <RotateCcw />
              Play again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const answered = selectedAnswer !== null;

  // ACTIVE GAME PLAYING
  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={cn("flex items-center gap-1.5 font-mono font-semibold tabular-nums", timeLeft <= 10 && "text-destructive")}>
            <Clock className="size-4 text-muted-foreground" />
            {timeLeft}s
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className={cn("size-4", streak > 0 && "text-primary")} />
            <span className="tabular-nums">{streak}</span> in a row
          </span>
          <span className="text-muted-foreground">
            Score <span className="font-mono font-semibold tabular-nums text-foreground">{score}</span>
          </span>
        </div>
        <Progress
          value={(timeLeft / 60) * 100}
          aria-label={`${timeLeft} seconds left`}
          className={cn("h-1.5", timeLeft <= 10 && "bg-destructive/20 [&>[data-slot=progress-indicator]]:bg-destructive")}
        />
      </div>

      {currentWord && (
        <Card className="gap-5 py-5 sm:py-6">
          <CardContent className="space-y-5 px-4 sm:px-6">
            <WordPrompt
              text={currentWord.kanji || currentWord.hiragana}
              reading={currentWord.kanji ? currentWord.hiragana : null}
              romaji={currentWord.romaji}
              showReading={showFurigana}
              onToggleReading={() => setShowFurigana((open) => !open)}
              onListen={() => speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate })}
              meta={
                <>
                  <Badge variant="outline">{currentWord.topic}</Badge>
                  <Badge variant="secondary">{currentWord.partOfSpeech}</Badge>
                </>
              }
            />

            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((option, idx) => (
                <AnswerOption
                  key={idx}
                  index={idx}
                  disabled={answered}
                  state={answerState(answered, option === currentWord.english, selectedAnswer === option)}
                  onSelect={() => handleAnswer(option)}
                >
                  {lessonText(locale, option)}
                </AnswerOption>
              ))}
            </div>

            {answered && (
              <AnswerFeedback
                correct={selectedAnswer === currentWord.english}
                answer={lessonText(locale, currentWord.english)}
                nextLabel="Next"
                onNext={() => generateQuestion()}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
