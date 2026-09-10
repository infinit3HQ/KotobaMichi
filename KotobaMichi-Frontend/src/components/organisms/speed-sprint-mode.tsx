"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  JLPT_N5_WORDS,
  JLPT_TOPICS,
  getQuizDistractors,
  type JLPTWord,
} from "@/data/vocab-n5";
import { JLPT_N4_WORDS, JLPT_N3_WORDS } from "@/data/vocab-more";
import { getTanosWordsByLevel } from "@/data/vocab-tanos";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese, playSfx } from "@/lib/audio";
import {
  Zap,
  Volume2,
  RotateCcw,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Eye,
  EyeOff,
} from "lucide-react";

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

  // Filter pool by level and topic
  const levelWords = useMemo(() => {
    const tanos = getTanosWordsByLevel(selectedLevel);
    if (tanos && tanos.length > 0) return tanos;
    if (selectedLevel === "N4") return JLPT_N4_WORDS;
    if (selectedLevel === "N3") return JLPT_N3_WORDS;
    return JLPT_N5_WORDS;
  }, [selectedLevel]);

  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return levelWords;
    return levelWords.filter((w) => w.topic === selectedTopic);
  }, [levelWords, selectedTopic]);

  // Next Question Generator
  const generateQuestion = useCallback(() => {
    if (wordPool.length === 0) return;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const distractors = getQuizDistractors(word, 3);
    const allOptions = [...distractors, word.english].sort(() => 0.5 - Math.random());

    setCurrentWord(word);
    setOptions(allOptions);
    setSelectedAnswer(null);

    // Pronounce word immediately for audio-visual binding
    speakJapanese(word.kanji || word.hiragana, { rate: speechRate });
  }, [wordPool, speechRate]);

  // Start Game
  const startGame = () => {
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setHistory([]);
    setTimeLeft(60);
    setGameState("playing");
    generateQuestion();
    if (soundEnabled) playSfx("flip");
  };

  // Timer Countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("gameover");
      if (soundEnabled) playSfx("streak");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, soundEnabled]);

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

      // Quick progression to next question
      setTimeout(() => {
        generateQuestion();
      }, 550);
    },
    [currentWord, selectedAnswer, streak, highestStreak, soundEnabled, generateQuestion]
  );

  // Keyboard Navigation: keys 1, 2, 3, 4 and R for repeat
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [gameState, options, handleAnswer, currentWord, speechRate]);

  if (gameState === "idle") {
    return (
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-3.5 bg-amber-500/10 text-amber-600 rounded-full w-fit mb-2">
            <Zap className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">60-Second Vocab Blitz</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Test your active vocabulary recall at lightning speed. Pair Japanese sound with meaning before the clock runs out!
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
                All Topics ({JLPT_N5_WORDS.length})
              </Button>
              {JLPT_TOPICS.slice(0, 11).map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  className="text-xs rounded-full h-7"
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50 border text-center">
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-lg font-bold">60s</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Controls</div>
              <div className="text-lg font-bold">Keys 1–4</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Audio</div>
              <div className="text-lg font-bold">Native Voice</div>
            </div>
          </div>

          <Button size="lg" className="w-full text-base font-semibold gap-2 shadow-sm" onClick={startGame}>
            <Zap className="h-5 w-5 fill-current" />
            Start Sprint Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === "gameover") {
    const accuracy = history.length > 0 ? Math.round((history.filter((h) => h.isCorrect).length / history.length) * 100) : 0;

    return (
      <Card className="border-2 border-primary/20 max-w-lg mx-auto text-center shadow-lg">
        <CardHeader className="pb-2">
          <div className="mx-auto p-4 bg-amber-500/10 text-amber-500 rounded-full w-fit mb-2">
            <Trophy className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Sprint Complete!</CardTitle>
          <CardDescription>Incredible effort! Here is your speed summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/60 border">
            <div>
              <div className="text-xs text-muted-foreground">Final Score</div>
              <div className="text-2xl font-extrabold text-primary">{score}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Highest Streak</div>
              <div className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 fill-amber-500" />
                {highestStreak}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="text-2xl font-extrabold text-emerald-500">{accuracy}%</div>
            </div>
          </div>

          {/* Quick Review of words */}
          <div className="text-left space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Words Practiced ({history.length})
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${
                    item.isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-destructive/5 border-destructive/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="font-semibold">{item.word.kanji || item.word.hiragana}</span>
                    <span className="text-xs text-muted-foreground">({item.word.hiragana})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{item.word.english}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => speakJapanese(item.word.kanji || item.word.hiragana, { rate: speechRate })}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setGameState("idle")}>
              Change Topic
            </Button>
            <Button className="flex-1 gap-2" onClick={startGame}>
              <RotateCcw className="h-4 w-4" /> Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ACTIVE GAME PLAYING
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* HUD Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? "text-destructive animate-pulse" : ""}`}>
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-amber-500">
          <Flame className={`h-5 w-5 ${streak > 0 ? "fill-amber-500" : "text-muted-foreground"}`} />
          <span>{streak} Streak</span>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="font-mono font-extrabold text-lg text-primary">{score}</div>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 10 ? "bg-destructive" : timeLeft <= 25 ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      {/* Main Flash Question Card */}
      {currentWord && (
        <Card className="border-2 shadow-md relative overflow-hidden">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentWord.topic}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentWord.partOfSpeech}
              </Badge>
            </div>

            {/* Kanji / Hiragana with Furigana toggle */}
            <div className="space-y-1">
              {showFurigana && currentWord.kanji && (
                <div className="text-sm font-medium text-primary tracking-wide">{currentWord.hiragana}</div>
              )}
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                {currentWord.kanji || currentWord.hiragana}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{currentWord.romaji}</div>
            </div>

            {/* Interactive Audio & Furigana Button */}
            <div className="flex justify-center items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate })}
                className="gap-1.5 text-xs rounded-full"
              >
                <Volume2 className="h-3.5 w-3.5 text-primary" />
                Listen <span className="opacity-50 text-[10px]">(R)</span>
              </Button>
              {currentWord.kanji && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFurigana(!showFurigana)}
                  className="gap-1.5 text-xs text-muted-foreground rounded-full"
                >
                  {showFurigana ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showFurigana ? "Hide Furigana" : "Furigana"}
                </Button>
              )}
            </div>

            {/* 4 Interactive Option Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentWord.english;

                let variantClass = "border-border/80 hover:border-primary/50 hover:bg-muted/30";
                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    variantClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    variantClass = "border-destructive bg-destructive/10 text-destructive";
                  } else {
                    variantClass = "opacity-40";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleAnswer(option)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${variantClass}`}
                  >
                    <span className="font-medium text-sm leading-snug">{option}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 ml-2">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
