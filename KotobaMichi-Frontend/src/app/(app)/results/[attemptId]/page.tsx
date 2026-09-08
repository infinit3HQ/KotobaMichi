"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Separator } from "@/components/atoms/separator";
import { useResultsStore } from "@/stores/results";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizResultsPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string;
  const result = useResultsStore((s) => s.get(attemptId));

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">Attempt ID:</p>
          <p className="font-mono text-sm">{attemptId}</p>
          <p className="text-sm text-muted-foreground">
            Detailed results are shown immediately after submission. If you
            refreshed, they may be unavailable.
          </p>
          <Button asChild className="mt-2">
            <Link href="/quizzes">Back to quizzes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const percent = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-base">
              Score: {result.score} / {result.totalQuestions}
            </Badge>
            <Badge
              variant={percent >= 70 ? "default" : "destructive"}
              className="text-base"
            >
              {percent}%
            </Badge>
          </div>
          <Separator />
          <ul className="space-y-3">
            {result.results.map((item) => (
              <li key={item.wordId} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">
                      {item.word.hiragana || item.word.kanji || item.word.romaji}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      English: {item.word.english}
                    </div>
                    <div className="text-sm mt-1">
                      Your answer:{" "}
                      <span className="font-medium">
                        {item.userAnswer || "—"}
                      </span>
                    </div>
                    {!item.isCorrect && (
                      <div className="text-sm text-muted-foreground">
                        Correct: {item.correctAnswers.join(", ")}
                      </div>
                    )}
                  </div>
                  {item.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href="/quizzes">Back to quizzes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
