"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QuizDetail, SubmitAnswer, SubmitQuizResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import { useResultsStore } from "@/stores/results";
import { toast } from "sonner";
import { speakJapanese } from "@/lib/audio";

export default function QuizTakingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => (await api.get<QuizDetail>(`/quizzes/${id}`)).data,
  });

  const words = useMemo(() => data?.quizWords ?? [], [data?.quizWords]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (answersPayload: SubmitAnswer[]) =>
      (
        await api.post<SubmitQuizResponse>(`/quizzes/${id}/submit`, {
          answers: answersPayload,
        })
      ).data,
    onSuccess: (res) => {
      toast.success("Submitted");
      // Persist results locally so results page can render detailed breakdown
      useResultsStore.getState().save(res);
      router.push(`/results/${res.attemptId}`);
    },
    onError: () => toast.error("Submission failed"),
  });

  const onAnswer = (val: string) => {
    const wordId = words[index]?.wordId;
    if (!wordId) return;
    setAnswers((a) => ({ ...a, [wordId]: val }));
  };

  const onNext = () =>
    setIndex((i) => Math.min(i + 1, Math.max(0, words.length - 1)));
  const onPrev = () => setIndex((i) => Math.max(0, i - 1));
  const onSubmit = () => {
    const payload: SubmitAnswer[] = words.map((qw) => ({
      wordId: qw.wordId,
      answer: answers[qw.wordId] ?? "",
    }));
    mutation.mutate(payload);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading quiz…</p>
        ) : isError || !data ? (
          <p className="text-destructive">Failed to load quiz.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{data.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {words.length === 0 ? (
                <p className="text-muted-foreground">No words in this quiz.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Question {index + 1} of {words.length}
                    </span>
                  </div>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="text-2xl font-semibold">
                      {words[index].word.hiragana ||
                        words[index].word.kanji ||
                        words[index].word.romaji}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const w = words[index].word;
                        speakJapanese(w.kanji || w.hiragana || w.romaji || "");
                      }}
                      aria-label="Play pronunciation"
                    >
                      <Volume2 className="h-4 w-4 mr-2" /> Listen
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      English?
                    </div>
                    <Input
                      value={answers[words[index].wordId] ?? ""}
                      onChange={(e) => onAnswer(e.target.value)}
                      placeholder="Type your answer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={onPrev}
                      disabled={index === 0}
                    >
                      Previous
                    </Button>
                    {index < words.length - 1 ? (
                      <Button onClick={onNext}>Next</Button>
                    ) : (
                      <Button onClick={onSubmit} disabled={mutation.isPending}>
                        {mutation.isPending ? "Submitting…" : "Submit"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
