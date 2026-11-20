"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { cn } from "@/lib/utils";
import { KANA_ROWS, ALL_KANA_CHARS, type KanaCharacter } from "@/data/kana";
import { speakJapanese, playSfx } from "@/lib/audio";
import { Play, Square, Volume2 } from "lucide-react";

interface KanaMasterModeProps {
  soundEnabled: boolean;
  speechRate: number;
}

type ScriptType = "hiragana" | "katakana";

const SCRIPT_OPTIONS = [
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" },
] as const;

export function KanaMasterMode({
  soundEnabled,
  speechRate,
}: KanaMasterModeProps) {
  const [scriptType, setScriptType] = useState<ScriptType>("hiragana");
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

  const [lastWrong, setLastWrong] = useState<string | null>(null);

  const replayPrompt = () => {
    if (currentPrompt) speakJapanese(currentPrompt[scriptType], { rate: speechRate });
  };

  const onKanaClick = (char: KanaCharacter) => {
    if (quizMode && currentPrompt) {
      setLastWrong(char.romaji === currentPrompt.romaji ? null : char.romaji);
    }
    handleKanaClick(char);
  };

  return (
    <Card className="gap-5 py-5 sm:py-6">
      <CardHeader className="gap-4 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base tracking-tight">Hear every sound</CardTitle>
            <CardDescription>
              Tap any character to hear it. Start the drill to find each sound you hear.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              value={scriptType}
              onValueChange={setScriptType}
              options={SCRIPT_OPTIONS}
              ariaLabel="Script"
            />
            <Button
              variant={quizMode ? "secondary" : "default"}
              onClick={() => {
                setLastWrong(null);
                if (quizMode) {
                  setQuizMode(false);
                } else {
                  startKanaQuiz();
                }
              }}
            >
              {quizMode ? <Square /> : <Play />}
              {quizMode ? "Stop drill" : "Start drill"}
            </Button>
          </div>
        </div>

        {quizMode && currentPrompt ? (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={replayPrompt} aria-label="Play the sound again">
                <Volume2 />
              </Button>
              <span className="text-sm">
                Find <span className="font-mono font-semibold text-primary">{currentPrompt.romaji}</span>
              </span>
              {lastWrong ? <span className="text-sm text-destructive">Not {lastWrong}, try again</span> : null}
            </div>
            <span className="text-sm text-muted-foreground">
              Score <span className="font-mono font-semibold tabular-nums text-foreground">{kanaScore}</span>
            </span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {KANA_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{row.name}</p>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {row.chars.map((char, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => onKanaClick(char)}
                  aria-label={`${char[scriptType]} ${char.romaji}`}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center rounded-lg border bg-card p-1.5 transition-colors outline-none sm:p-2.5",
                    "hover:border-primary/40 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    lastWrong === char.romaji && "border-destructive bg-destructive/10"
                  )}
                >
                  <span lang="ja" className="font-jp text-2xl font-bold sm:text-3xl">
                    {char[scriptType]}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{char.romaji}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
