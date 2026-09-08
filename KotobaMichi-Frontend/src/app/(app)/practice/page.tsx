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
import { KANA_ROWS, ALL_KANA_CHARS, type KanaCharacter } from "@/data/kana";
import { speakJapanese, playSfx } from "@/lib/audio";
import {
  Zap,
  Headphones,
  Grid,
  Layers,
  Volume2,
  RotateCcw,
  Flame,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  VolumeX,
  Volume1,
} from "lucide-react";

type PracticeMode = "sprint" | "listening" | "kana" | "flashcard";

export default function PracticeDojoPage() {
  const [mode, setMode] = useState<PracticeMode>("sprint");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥋</span>
            <h1 className="text-3xl font-extrabold tracking-tight">KotobaMichi Dojo</h1>
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-3.5 w-3.5 fill-primary" /> Fast-Track
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Master Japanese through high-speed active recall, native speech synthesis, and multisensory drills.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newRate = speechRate === 0.92 ? 0.72 : 0.92;
              setSpeechRate(newRate);
              if (soundEnabled) {
                speakJapanese("こんにちは", { rate: newRate });
              }
            }}
            title="Toggle normal or slower pronunciation speed"
            className="text-xs gap-1.5"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Speed: {speechRate === 0.92 ? "1.0x" : "0.75x"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? <Volume1 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <ModeTabButton
          active={mode === "sprint"}
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          title="Speed Sprint"
          subtitle="60s Rapid Fire"
          onClick={() => setMode("sprint")}
        />
        <ModeTabButton
          active={mode === "listening"}
          icon={<Headphones className="h-4 w-4 text-sky-500" />}
          title="Listening Ear"
          subtitle="Audio-first Quiz"
          onClick={() => setMode("listening")}
        />
        <ModeTabButton
          active={mode === "kana"}
          icon={<Grid className="h-4 w-4 text-emerald-500" />}
          title="Kana Board"
          subtitle="Soundboard & Drills"
          onClick={() => setMode("kana")}
        />
        <ModeTabButton
          active={mode === "flashcard"}
          icon={<Layers className="h-4 w-4 text-purple-500" />}
          title="3D Flashcards"
          subtitle="Spaced Repetition"
          onClick={() => setMode("flashcard")}
        />
      </div>

      {/* Mode Content */}
      <div className="mt-4">
        {mode === "sprint" && (
          <SpeedSprintMode
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "listening" && (
          <ListeningEarMode
            selectedTopic={selectedTopic}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "kana" && <KanaMasterMode soundEnabled={soundEnabled} speechRate={speechRate} />}
        {mode === "flashcard" && (
          <FlashcardSrsMode
            selectedTopic={selectedTopic}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
      </div>
    </div>
  );
}

function ModeTabButton({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
        active
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border/60 hover:border-border hover:bg-muted/40"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-primary/10" : "bg-muted"}`}>{icon}</div>
      <div>
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}

/* =========================================================================
   MODE 1: SPEED SPRINT (60-SECOND VOCAB BLITZ)
   ========================================================================= */

function SpeedSprintMode({
  selectedTopic,
  onSelectTopic,
  soundEnabled,
  speechRate,
}: {
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  soundEnabled: boolean;
  speechRate: number;
}) {
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

  // Filter pool by topic
  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return JLPT_N5_WORDS;
    return JLPT_N5_WORDS.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic]);

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

/* =========================================================================
   MODE 2: LISTENING EAR-TRAINER (AUDIO-FIRST LEARNING)
   ========================================================================= */

function ListeningEarMode({
  selectedTopic,
  soundEnabled,
  speechRate,
}: {
  selectedTopic: string;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return JLPT_N5_WORDS;
    return JLPT_N5_WORDS.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic]);

  const nextQuestion = useCallback(() => {
    if (wordPool.length === 0) return;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const distractors = getQuizDistractors(word, 3);
    const allOptions = [...distractors, word.english].sort(() => 0.5 - Math.random());

    setCurrentWord(word);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsRevealed(false);

    // Play pronunciation immediately for blind listening
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

    const correct = chosen === currentWord.english;
    if (correct) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }
  };

  return (
    <Card className="border-2 max-w-xl mx-auto shadow-md">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
          <span>Ear Training</span>
          <span>
            Score: {score}/{totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          <Headphones className="h-5 w-5 text-sky-500" />
          Blind Listening Challenge
        </CardTitle>
        <CardDescription>
          Listen carefully to the native Japanese pronunciation, then identify what it means.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 text-center">
        {/* Giant Play Audio Button */}
        {currentWord && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <button
              onClick={() => speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate })}
              className="p-6 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 transition-all border-2 border-sky-500/30 hover:scale-105 active:scale-95 shadow-sm"
              title="Click to replay spoken audio"
            >
              <Volume2 className="h-12 w-12" />
            </button>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Click speaker to repeat</span>
              <span className="opacity-40">•</span>
              <button
                onClick={() => speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: 0.7 })}
                className="text-sky-600 underline font-medium"
              >
                Play Slow (0.7x)
              </button>
            </div>

            {/* Revealed word after answer */}
            {isRevealed && (
              <div className="p-4 rounded-xl bg-muted/60 border w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="text-2xl font-bold">{currentWord.kanji || currentWord.hiragana}</div>
                <div className="text-sm text-muted-foreground">{currentWord.hiragana} ({currentWord.romaji})</div>
                <div className="text-xs text-primary font-medium mt-1">{currentWord.topic} • {currentWord.partOfSpeech}</div>
              </div>
            )}
          </div>
        )}

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = currentWord && option === currentWord.english;

            let btnClass = "border-border/80 hover:border-sky-500/50 hover:bg-muted/30";
            if (selectedAnswer !== null) {
              if (isCorrect) {
                btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold";
              } else if (isSelected && !isCorrect) {
                btnClass = "border-destructive bg-destructive/10 text-destructive";
              } else {
                btnClass = "opacity-40";
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleSelect(option)}
                className={`p-3.5 rounded-xl border text-sm font-medium transition-all ${btnClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <Button onClick={nextQuestion} className="w-full gap-2 mt-4" size="lg">
            Next Word <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   MODE 3: KANA SOUNDBOARD & SPEED DRILLS
   ========================================================================= */

function KanaMasterMode({
  soundEnabled,
  speechRate,
}: {
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [scriptType, setScriptType] = useState<"hiragana" | "katakana">("hiragana");
  const [quizMode, setQuizMode] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<KanaCharacter | null>(null);
  const [kanaScore, setKanaScore] = useState(0);

  const startKanaQuiz = () => {
    setQuizMode(true);
    setKanaScore(0);
    pickNextKana();
  };

  const pickNextKana = useCallback(() => {
    const random = ALL_KANA_CHARS[Math.floor(Math.random() * ALL_KANA_CHARS.length)];
    setCurrentPrompt(random);
    speakJapanese(random[scriptType], { rate: speechRate });
  }, [scriptType, speechRate]);

  const handleKanaClick = (char: KanaCharacter) => {
    const soundChar = char[scriptType];
    speakJapanese(soundChar, { rate: speechRate });

    if (quizMode && currentPrompt) {
      if (char.romaji === currentPrompt.romaji) {
        setKanaScore((prev) => prev + 1);
        if (soundEnabled) playSfx("correct");
        pickNextKana();
      } else {
        if (soundEnabled) playSfx("wrong");
      }
    }
  };

  return (
    <Card className="border-2 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Grid className="h-5 w-5 text-emerald-500" />
              Kana Mastery Soundboard
            </CardTitle>
            <CardDescription>
              Click any character to hear its authentic pronunciation. Toggle Quiz mode to test kana speed!
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-lg bg-muted border">
              <button
                onClick={() => setScriptType("hiragana")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  scriptType === "hiragana" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Hiragana (平仮名)
              </button>
              <button
                onClick={() => setScriptType("katakana")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  scriptType === "katakana" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Katakana (片仮名)
              </button>
            </div>

            <Button
              variant={quizMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (quizMode) {
                  setQuizMode(false);
                } else {
                  startKanaQuiz();
                }
              }}
              className="text-xs"
            >
              {quizMode ? `Exit Drill (${kanaScore})` : "⚡ Start Drill"}
            </Button>
          </div>
        </div>

        {/* Drill banner */}
        {quizMode && currentPrompt && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2
                className="h-5 w-5 text-primary cursor-pointer hover:scale-110"
                onClick={() => speakJapanese(currentPrompt[scriptType], { rate: speechRate })}
              />
              <span className="text-sm font-semibold">
                Find sound: <span className="font-mono text-primary font-black uppercase text-base">&quot;{currentPrompt.romaji}&quot;</span>
              </span>
            </div>
            <div className="text-xs font-bold text-muted-foreground">Score: {kanaScore}</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          {KANA_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground">{row.name}</div>
              <div className="grid grid-cols-5 gap-2">
                {row.chars.map((char, cIdx) => {
                  const displayChar = char[scriptType];
                  const isTarget = quizMode && currentPrompt?.romaji === char.romaji;

                  return (
                    <button
                      key={cIdx}
                      onClick={() => handleKanaClick(char)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 group ${
                        isTarget
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border/70 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl font-bold group-hover:text-emerald-600 transition-colors">
                        {displayChar}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground mt-0.5">{char.romaji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   MODE 4: 3D SRS FLASHCARDS (ACTIVE RECALL & FURIGANA EXPLORER)
   ========================================================================= */

function FlashcardSrsMode({
  selectedTopic,
  soundEnabled,
  speechRate,
}: {
  selectedTopic: string;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);

  const wordPool = useMemo(() => {
    if (selectedTopic === "All") return JLPT_N5_WORDS;
    return JLPT_N5_WORDS.filter((w) => w.topic === selectedTopic);
  }, [selectedTopic]);

  const currentWord = wordPool[currentIndex] || wordPool[0];

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
    if (soundEnabled) playSfx("flip");
  }, [soundEnabled]);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % wordPool.length);
  }, [wordPool.length]);

  const prevCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + wordPool.length) % wordPool.length);
  }, [wordPool.length]);

  // Keyboard shortcut: Space to flip, Arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        nextCard();
      } else if (e.code === "ArrowLeft") {
        prevCard();
      } else if (e.key.toLowerCase() === "r" && currentWord) {
        speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, nextCard, prevCard, currentWord, speechRate]);

  if (!currentWord) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Settings strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant={showFurigana ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFurigana(!showFurigana)}
            className="text-xs h-7 gap-1"
          >
            {showFurigana ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Furigana
          </Button>
          <Button
            variant={showRomaji ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowRomaji(!showRomaji)}
            className="text-xs h-7 gap-1"
          >
            Romaji
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Card {currentIndex + 1} / {wordPool.length}
        </div>
      </div>

      {/* 3D Flashcard */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none rounded-2xl border-2 border-primary/20 bg-card p-8 min-h-[300px] flex flex-col justify-between items-center text-center shadow-lg hover:border-primary/40 transition-all group"
      >
        {/* Card Header Tags */}
        <div className="w-full flex justify-between items-center text-xs">
          <Badge variant="outline">{currentWord.topic}</Badge>
          <span className="text-muted-foreground text-[11px] group-hover:text-primary transition-colors">
            Click or [Space] to flip
          </span>
          <Badge variant="secondary">{currentWord.level}</Badge>
        </div>

        {/* Card Body */}
        {!flipped ? (
          <div className="space-y-3 my-auto">
            {showFurigana && currentWord.kanji && (
              <div className="text-lg font-medium text-primary tracking-widest">{currentWord.hiragana}</div>
            )}
            <div className="text-5xl font-black tracking-tight">{currentWord.kanji || currentWord.hiragana}</div>
            {showRomaji && <div className="text-sm text-muted-foreground font-mono">{currentWord.romaji}</div>}
          </div>
        ) : (
          <div className="space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="text-3xl font-bold text-primary">{currentWord.english}</div>
            <div className="text-sm text-muted-foreground font-medium">
              {currentWord.kanji ? `${currentWord.kanji} (${currentWord.hiragana})` : currentWord.hiragana}
            </div>
            <Badge variant="outline" className="text-xs">
              Part of speech: {currentWord.partOfSpeech}
            </Badge>
          </div>
        )}

        {/* Card Footer controls */}
        <div className="w-full flex justify-between items-center pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate });
            }}
            className="gap-1.5 text-xs"
          >
            <Volume2 className="h-4 w-4 text-primary" /> Listen (R)
          </Button>

          <span className="text-xs text-muted-foreground">
            {flipped ? "Definition" : "Question"}
          </span>
        </div>
      </div>

      {/* SRS Confidence Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          className="border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 text-xs flex flex-col py-3 h-auto"
          onClick={() => {
            if (soundEnabled) playSfx("wrong");
            nextCard();
          }}
        >
          <span className="font-bold">Again</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">&lt; 1m</span>
        </Button>
        <Button
          variant="outline"
          className="border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 text-xs flex flex-col py-3 h-auto"
          onClick={() => {
            if (soundEnabled) playSfx("correct");
            nextCard();
          }}
        >
          <span className="font-bold">Hard</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">1d</span>
        </Button>
        <Button
          variant="outline"
          className="border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-600 text-xs flex flex-col py-3 h-auto"
          onClick={() => {
            if (soundEnabled) playSfx("correct");
            nextCard();
          }}
        >
          <span className="font-bold">Good</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">3d</span>
        </Button>
        <Button
          variant="outline"
          className="border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 text-xs flex flex-col py-3 h-auto"
          onClick={() => {
            if (soundEnabled) playSfx("streak");
            nextCard();
          }}
        >
          <span className="font-bold">Easy</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">7d</span>
        </Button>
      </div>
    </div>
  );
}
