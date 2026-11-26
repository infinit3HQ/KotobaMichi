"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Repeat, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { api } from "@/lib/api";
import type { MockExam } from "@/lib/mock-exam";
import { missedReviewable } from "@/lib/mock-mistakes";
import { shareQuery } from "@/lib/share-card";

type AddResult = { added: number; existing: number; missed: number };

/** Turns the questions missed on this sitting into review cards. */
function AddMistakes({ exam, answers, completed }: { exam: MockExam; answers: Record<string, number>; completed: readonly string[] }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const missed = missedReviewable(exam, answers, completed).length;
  if (missed === 0) return null;

  const add = async () => {
    setState("saving");
    try {
      const { data } = await api.post<AddResult>(`/mock-exams/${exam.id}/mistakes`);
      setState("done");
      void queryClient.invalidateQueries({ queryKey: ["learning", "summary"] });
      void queryClient.removeQueries({ queryKey: ["review", "mistakes"] });
      toast.success(
        data.added > 0
          ? `Added ${data.added} ${data.added === 1 ? "question" : "questions"} to your review.`
          : "These questions are already in your review."
      );
    } catch {
      setState("idle");
      toast.error("Could not add the questions. Try again.");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="font-semibold tracking-tight">
          {missed} vocabulary and grammar {missed === 1 ? "question" : "questions"} to learn from
        </p>
        <p className="text-sm text-muted-foreground">They come back on a schedule until you get them right.</p>
      </div>
      {state === "done" ? (
        <Button asChild>
          <Link href="/review">
            <Check />
            Review them now
          </Link>
        </Button>
      ) : (
        <Button type="button" onClick={add} disabled={state === "saving"}>
          <Repeat />
          Add to review
        </Button>
      )}
    </div>
  );
}

/** Shares the score as a link with a preview image, or copies it where sharing is not supported. */
function ShareResult({
  examId,
  total,
  max,
  passes,
  sections,
}: {
  examId: string;
  total: number;
  max: number;
  passes: boolean;
  sections: { id: string; points: number }[];
}) {
  const share = async () => {
    const url = `${window.location.origin}/share/mock?${shareQuery({ examId, total, max, passes, sections })}`;
    const title = `I scored ${Math.round(total)}/${max} on a JLPT mock`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share. Try again.");
    }
  };

  return (
    <Button type="button" variant="outline" onClick={share}>
      <Share2 />
      Share result
    </Button>
  );
}

/** What to do next after a sitting: learn from the misses, or share the score. */
export function ResultsActions({
  exam,
  answers,
  completed,
  signedIn,
  score,
}: {
  exam: MockExam;
  answers: Record<string, number>;
  completed: readonly string[];
  signedIn: boolean;
  score: { total: number; max: number; passes: boolean; sections: { id: string; points: number }[] } | null;
}) {
  const canAdd = signedIn && missedReviewable(exam, answers, completed).length > 0;
  if (!canAdd && !score) return null;
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4 sm:p-6">
        {canAdd ? <AddMistakes exam={exam} answers={answers} completed={completed} /> : null}
        {score ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
            <p className="text-sm text-muted-foreground">Studying with a friend? Share your score and compare.</p>
            <ShareResult examId={exam.id} {...score} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
