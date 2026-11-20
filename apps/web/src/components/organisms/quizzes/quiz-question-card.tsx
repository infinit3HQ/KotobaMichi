"use client";

import { Check, Volume2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { useLocale } from "@/components/organisms/locale-provider";
import { speakJapanese } from "@/lib/audio";
import { cn } from "@/lib/utils";
import type { Word } from "@/types/api";

type QuizQuestionCardProps = {
  word: Word;
  options: string[];
  answer: string;
  onAnswer: (value: string) => void;
};

/** One quiz question: the Japanese word, a listen button, and the answer choices. */
export function QuizQuestionCard({ word, options, answer, onAnswer }: QuizQuestionCardProps) {
  const { t } = useLocale();
  const headword = word.kanji || word.hiragana || word.romaji || "";
  const reading = word.kanji && word.hiragana ? word.hiragana : null;
  const multipleChoice = options.length >= 2;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p lang="ja" className="font-jp text-3xl font-bold break-words sm:text-4xl">
              {headword}
            </p>
            {reading ? (
              <p lang="ja" className="mt-1 font-jp text-sm text-muted-foreground">
                {reading}
              </p>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => speakJapanese(headword)} aria-label={t.quizzes.listen}>
            <Volume2 />
            <span className="hidden sm:inline">{t.quizzes.listen}</span>
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {multipleChoice ? t.quizzes.choosePrompt : t.quizzes.typePrompt}
          </p>
          {multipleChoice ? (
            <div className="grid gap-2" role="group" aria-label={t.quizzes.choosePrompt}>
              {options.map((option) => {
                const selected = option === answer;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    aria-pressed={selected}
                    onClick={() => onAnswer(option)}
                    className={cn(
                      "h-auto min-h-9 w-full justify-between py-2 text-left whitespace-normal",
                      selected && "border-primary bg-primary/5 text-foreground hover:bg-primary/10"
                    )}
                  >
                    <span className="min-w-0 break-words">{option}</span>
                    {selected ? <Check className="text-primary" /> : null}
                  </Button>
                );
              })}
            </div>
          ) : (
            <Input
              value={answer}
              onChange={(event) => onAnswer(event.target.value)}
              placeholder={t.quizzes.typePlaceholder}
              aria-label={t.quizzes.typePrompt}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Loading placeholder in the shape of the quiz-taking screen. */
export function QuizTakingSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-muted" />
        <Skeleton className="h-2 w-full rounded-full bg-muted" />
      </div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <Skeleton className="h-9 w-32 bg-muted" />
            <Skeleton className="h-9 w-9 bg-muted sm:w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-muted" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
