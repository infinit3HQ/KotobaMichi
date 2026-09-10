"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { KANA_ROWS, ALL_KANA_CHARS, type KanaCharacter } from "@/data/kana";
import { speakJapanese, playSfx } from "@/lib/audio";
import { Grid, Volume2 } from "lucide-react";

interface KanaMasterModeProps {
  soundEnabled: boolean;
  speechRate: number;
}

export function KanaMasterMode({
  soundEnabled,
  speechRate,
}: KanaMasterModeProps) {
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
