"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  JLPT_LISTENING_SCENARIOS,
  type ListeningScenario,
} from "@/data/listening";
import type { JLPTLevel } from "@/data/grammar";
import {
  JLPT_N5_WORDS,
  getQuizDistractors,
  type JLPTWord,
} from "@/data/vocab-n5";
import { JLPT_N4_WORDS, JLPT_N3_WORDS } from "@/data/vocab-more";
import { speakJapanese, speakDialogue, stopSpeaking, playSfx } from "@/lib/audio";
import {
  Headphones,
  Volume2,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare,
  Sparkles,
  Radio,
} from "lucide-react";

interface ListeningComprehensionModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

export function ListeningComprehensionMode({
  selectedLevel,
  soundEnabled,
  speechRate,
}: ListeningComprehensionModeProps) {
  const [subMode, setSubMode] = useState<"dialogue" | "words">("dialogue");

  // Filter dialogues by level
  const scenarios = useMemo(() => {
    return JLPT_LISTENING_SCENARIOS.filter((s) => s.level === selectedLevel);
  }, [selectedLevel]);

  // Filter words by level
  const levelWords = useMemo(() => {
    if (selectedLevel === "N4") return JLPT_N4_WORDS;
    if (selectedLevel === "N3") return JLPT_N3_WORDS;
    return JLPT_N5_WORDS;
  }, [selectedLevel]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Submode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-bold">
            {selectedLevel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Listening Dojo • {subMode === "dialogue" ? `${scenarios.length} Situational Dialogues` : `${levelWords.length} Audio Words`}
          </span>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-muted border">
          <button
            onClick={() => setSubMode("dialogue")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              subMode === "dialogue" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
            Task Dialogues (課題理解)
          </button>
          <button
            onClick={() => setSubMode("words")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              subMode === "words" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-primary" />
            Word Ear-Trainer (単語)
          </button>
        </div>
      </div>

      {subMode === "dialogue" ? (
        <SituationalDialogueQuiz
          scenarios={scenarios}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      ) : (
        <BlindWordListeningQuiz
          wordPool={levelWords}
          selectedLevel={selectedLevel}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      )}
    </div>
  );
}

/* =========================================================================
   SUB-MODE 1: SITUATIONAL TASK DIALOGUES (課題理解 & ポイント理解)
   ========================================================================= */

function SituationalDialogueQuiz({
  scenarios,
  selectedLevel,
  soundEnabled,
  speechRate,
}: {
  scenarios: ListeningScenario[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}) {
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

  const handlePlayDialogue = async (speedRate?: number) => {
    if (!currentScenario) return;
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      setActiveLine(null);
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

  const handleStopAudio = () => {
    stopSpeaking();
    setIsPlaying(false);
    setActiveLine(null);
  };

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentScenario) return;
    setSelectedAnswer(index);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = index === currentScenario.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }
  };

  const handleNext = () => {
    handleStopAudio();
    setSelectedAnswer(null);
    setShowScript(false);
    setSIndex((prev) => (prev + 1) % scenarios.length);
  };

  if (!currentScenario) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground text-sm">
          No {selectedLevel} listening comprehension scenarios available currently.
        </p>
      </Card>
    );
  }

  const isAnswered = selectedAnswer !== null;

  return (
    <Card className="border-2 shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-sky-500/30 text-sky-600 dark:text-sky-400">
              <Headphones className="h-3.5 w-3.5" />
              {currentScenario.level} 聴解
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentScenario.category}
            </Badge>
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            Score: {score}/{totalAttempts}
          </div>
        </div>

        <CardTitle className="text-lg font-bold pt-2 flex items-center justify-between">
          <span>{currentScenario.title}</span>
          <span className="text-xs font-normal text-muted-foreground font-mono">
            Scenario {sIndex + 1}/{scenarios.length}
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          Listen to the situational conversation, then answer the comprehension question.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Situation Description Box */}
        <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-1">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Situation
          </div>
          <div className="text-base font-bold text-foreground">
            {currentScenario.situationJapanese}
          </div>
          <div className="text-xs text-muted-foreground italic">
            &ldquo;{currentScenario.situationEnglish}&rdquo;
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-6 rounded-2xl bg-card border-2 shadow-xs text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => handlePlayDialogue()}
              className={`p-6 rounded-full transition-all border-2 flex items-center justify-center hover:scale-105 active:scale-95 shadow-md ${
                isPlaying
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                  : "bg-sky-500/10 text-sky-600 border-sky-500/30 hover:bg-sky-500/20"
              }`}
              title={isPlaying ? "Stop Audio" : "Play Conversation"}
            >
              {isPlaying ? <Square className="h-10 w-10 fill-white" /> : <Play className="h-10 w-10 fill-sky-600 ml-1" />}
            </button>

            <div className="text-sm font-semibold text-foreground">
              {isPlaying ? "Playing Japanese Dialogue..." : "Click to Play Full Dialogue"}
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePlayDialogue(0.72)}
                disabled={isPlaying}
                className="h-7 text-xs gap-1"
              >
                <Volume2 className="h-3 w-3 text-sky-500" /> Play Slower (0.75x)
              </Button>
              {isPlaying && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopAudio}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600"
                >
                  <Square className="h-3 w-3 mr-1" /> Stop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-muted/50 border space-y-1">
            <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Question (質問)
            </div>
            <div className="text-base sm:text-lg font-extrabold text-foreground">
              {currentScenario.questionJapanese}
            </div>
            <div className="text-xs text-muted-foreground italic">
              &ldquo;{currentScenario.questionEnglish}&rdquo;
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentScenario.options.map((opt, idx) => {
              const isChosen = selectedAnswer === idx;
              const isTarget = idx === currentScenario.correctAnswerIndex;

              let btnStyle = "border-border/80 hover:border-sky-500/60 hover:bg-sky-500/5";
              if (isAnswered) {
                if (isTarget) {
                  btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/30";
                } else if (isChosen && !isTarget) {
                  btnStyle = "border-destructive bg-destructive/15 text-destructive";
                } else {
                  btnStyle = "opacity-40";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`p-3.5 rounded-xl border-2 text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground ml-2 shrink-0">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback & Script Reveal */}
        {isAnswered && (
          <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                selectedAnswer === currentScenario.correctAnswerIndex
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {selectedAnswer === currentScenario.correctAnswerIndex ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
              )}
              <div className="text-sm font-bold">
                {selectedAnswer === currentScenario.correctAnswerIndex
                  ? "Correct! Excellent listening comprehension!"
                  : "Incorrect. Check the explanation and transcript below."}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/60 border text-xs leading-relaxed space-y-1">
              <span className="font-bold text-foreground">Listening Clue: </span>
              <span className="text-muted-foreground">{currentScenario.explanation}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScript(!showScript)}
                  className="gap-1.5 text-xs"
                >
                  {showScript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showScript ? "Hide Transcript" : "Reveal Dialogue Transcript"}
                </Button>

                <Button onClick={handleNext} className="gap-2 text-xs" size="sm">
                  Next Scenario <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {showScript && (
                <div className="p-4 rounded-xl bg-muted/30 border space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Dialogue Lines:
                    </div>
                    <div className="space-y-2">
                      {currentScenario.dialogue.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className={`p-2.5 rounded-lg border text-sm transition-all ${
                            activeLine === lIdx
                              ? "bg-primary/10 border-primary shadow-xs"
                              : "bg-background border-border/70"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {line.speaker}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => speakJapanese(line.japanese, { rate: speechRate })}
                              title="Listen to this line"
                            >
                              <Volume2 className="h-3 w-3 text-primary" />
                            </Button>
                          </div>
                          <div className="font-semibold text-foreground">{line.japanese}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{line.romaji}</div>
                          <div className="text-xs text-muted-foreground italic mt-0.5">&ldquo;{line.english}&rdquo;</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentScenario.vocabulary.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> Key Vocabulary:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentScenario.vocabulary.map((vocab, vIdx) => (
                          <div
                            key={vIdx}
                            className="p-2 rounded-lg bg-background border flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold">{vocab.word}</span>{" "}
                              <span className="text-muted-foreground">({vocab.reading})</span>
                            </div>
                            <span className="text-muted-foreground italic">{vocab.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================================
   SUB-MODE 2: BLIND WORD EAR-TRAINER (単語リスニング)
   ========================================================================= */

function BlindWordListeningQuiz({
  wordPool,
  selectedLevel,
  soundEnabled,
  speechRate,
}: {
  wordPool: JLPTWord[];
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}) {
  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const nextQuestion = useCallback(() => {
    if (wordPool.length === 0) return;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const distractors = getQuizDistractors(word, 3);
    const allOptions = [...distractors, word.english].sort(() => 0.5 - Math.random());

    setCurrentWord(word);
    setOptions(allOptions);
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

    const correct = chosen === currentWord.english;
    if (correct) {
      setScore((prev) => prev + 1);
      if (soundEnabled) playSfx("correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }
  };

  return (
    <Card className="border-2 shadow-md">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
          <Badge variant="outline">{selectedLevel} 単語耳トレ</Badge>
          <span>
            Score: {score}/{totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          <Headphones className="h-5 w-5 text-sky-500" />
          Blind Word Audio Drill
        </CardTitle>
        <CardDescription>
          Listen to the native Japanese word pronunciation, then choose the correct meaning.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 text-center">
        {currentWord && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <button
              onClick={() => speakJapanese(currentWord.kanji || currentWord.hiragana, { rate: speechRate })}
              className="p-6 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 transition-all border-2 border-sky-500/30 hover:scale-105 active:scale-95 shadow-sm"
              title="Click to replay audio"
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

            {isRevealed && (
              <div className="p-4 rounded-xl bg-muted/60 border w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="text-2xl font-bold">{currentWord.kanji || currentWord.hiragana}</div>
                <div className="text-sm text-muted-foreground">{currentWord.hiragana} ({currentWord.romaji})</div>
                <div className="text-xs text-primary font-medium mt-1">{currentWord.topic} • {currentWord.partOfSpeech}</div>
              </div>
            )}
          </div>
        )}

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
