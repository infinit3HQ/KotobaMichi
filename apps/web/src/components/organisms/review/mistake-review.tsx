"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, PartyPopper, Repeat } from "lucide-react";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { ExamText } from "@/components/atoms/exam-text";
import { Progress } from "@/components/atoms/progress";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import type { JLPTLevel } from "@/data/grammar";
import { useLearning } from "@/hooks/use-learning";
import { useLoopText } from "@/hooks/use-loop-text";
import { api } from "@/lib/api";
import { optionTone } from "@/components/organisms/mock/mondai-sheet";
import { examLabel } from "@/lib/exam-plan";
import type { MistakeCard } from "@/lib/mock-mistakes";
import { cn } from "@/lib/utils";

async function loadDeck(): Promise<MistakeCard[]> {
  const { data } = await api.get<{ due: string[] }>("/learning/queue?kind=mock");
  if (data.due.length === 0) return [];
  const response = await fetch(`/api/mock-items?keys=${encodeURIComponent(data.due.join(","))}`);
  if (!response.ok) throw new Error(`Question lookup failed: ${response.status}`);
  const body = (await response.json()) as { cards: MistakeCard[] };
  return body.cards;
}

function choicesFor(card: MistakeCard) {
  return card.options.length > 0 ? card.options : [1, 2, 3, 4].map((number) => ({ number, text: "" }));
}

function QuestionCard({
  card,
  chosen,
  onChoose,
}: {
  card: MistakeCard;
  chosen: number | null;
  onChoose: (choice: number) => void;
}) {
  const text = useLoopText();
  const answered = chosen != null;
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <p className="text-xs text-muted-foreground">{text.review.from(examLabel(card.examId))}</p>
        <p className="font-jp text-sm leading-7 text-muted-foreground">
          <ExamText text={card.instruction} />
        </p>
        <p className="font-jp text-lg leading-10 break-words">
          <ExamText text={card.prompt} />
        </p>
        <div className="flex flex-col gap-2">
          {choicesFor(card).map((option) => {
            const isAnswer = answered && option.number === card.answer;
            const isWrong = answered && option.number === chosen && option.number !== card.answer;
            return (
              <Button
                key={option.number}
                type="button"
                variant="outline"
                disabled={answered}
                onClick={() => onChoose(option.number)}
                className={cn(
                  "font-jp h-auto min-h-10 w-full justify-start whitespace-normal py-2 text-left font-normal leading-7",
                  optionTone({ selected: option.number === chosen, correct: isAnswer, wrong: isWrong })
                )}
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{option.number}</span>
                {option.text ? (
                  <span className="min-w-0 break-words">
                    <ExamText text={option.text} />
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/** Missed mock questions that are due, one at a time. A right answer pushes the card further out. */
export function MistakeReview() {
  const text = useLoopText();
  const queryClient = useQueryClient();
  const { record } = useLearning();
  const deck = useQuery({ queryKey: ["review", "mistakes"], queryFn: loadDeck, staleTime: Infinity });
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);

  if (deck.isPending) return <Skeleton className="h-72 w-full rounded-xl" />;
  if (deck.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertDescription>{text.review.loadError}</AlertDescription>
      </Alert>
    );
  }

  const cards = deck.data;
  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Repeat}
        title={text.review.empty}
        description={text.review.emptyBody}
        action={
          <Button asChild variant="outline">
            <Link href="/mock">{text.review.toMocks}</Link>
          </Button>
        }
      />
    );
  }

  const card = cards[index];
  if (!card) {
    return (
      <EmptyState
        icon={PartyPopper}
        title={text.review.finished}
        description={text.review.finishedBody(cards.length)}
        action={
          <Button asChild>
            <Link href="/">{text.today.title}</Link>
          </Button>
        }
      />
    );
  }

  const choose = (choice: number) => {
    setChosen(choice);
    const grade = choice === card.answer ? "good" : "again";
    void record(card.itemKey, card.level as JLPTLevel, grade);
  };

  const next = () => {
    setChosen(null);
    setIndex((value) => value + 1);
    if (index + 1 >= cards.length) {
      void queryClient.invalidateQueries({ queryKey: ["learning", "summary"] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Progress value={(index / cards.length) * 100} aria-label={`${index} / ${cards.length}`} />
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {index + 1}/{cards.length}
        </span>
      </div>
      <QuestionCard key={card.itemKey} card={card} chosen={chosen} onChoose={choose} />
      {chosen != null ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn("text-sm font-medium", chosen === card.answer ? "text-chart-3" : "text-destructive")}>
            {chosen === card.answer ? text.review.correct : text.review.wrong(card.answer)}
          </p>
          <Button type="button" onClick={next} autoFocus>
            {text.review.next}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
