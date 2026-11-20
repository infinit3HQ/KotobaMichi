"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CreateQuizPayload, QuizDetail, WordsListResponse } from "@/types/api";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardFooter } from "@/components/atoms/card";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import { useLocale } from "@/components/organisms/locale-provider";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import { WordPicker } from "@/components/organisms/quizzes/word-picker";

export default function QuizCreationPage() {
  const { t } = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const wordsQuery = useQuery({
    queryKey: ["words", { page: 1, limit: 200 }],
    queryFn: async () => (await api.get<WordsListResponse>("/words", { params: { page: 1, limit: 200 } })).data,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateQuizPayload) => (await api.post<QuizDetail>("/quizzes", payload)).data,
    onSuccess: (quiz) => {
      toast.success(t.quizzes.created);
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      router.push(`/quizzes/${quiz.id}`);
    },
    onError: () => toast.error(t.quizzes.createFailed),
  });

  const onSubmit = () => {
    const wordIds = Object.entries(selected)
      .filter(([, picked]) => picked)
      .map(([wordId]) => wordId);
    if (!title.trim()) return toast.warning(t.quizzes.titleRequired);
    if (wordIds.length < 1) return toast.warning(t.quizzes.pickAtLeastOne);
    mutation.mutate({ title: title.trim(), description, isPublic, wordIds });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          eyebrow={t.quizzes.kicker}
          title={t.quizzes.createTitle}
          description={t.quizzes.createDesc}
          actions={
            <Button asChild variant="outline">
              <Link href="/quizzes">
                <ArrowLeft />
                {t.quizzes.backToQuizzes}
              </Link>
            </Button>
          }
        />
        <Card className="gap-0 py-0">
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="quiz-title">{t.quizzes.fieldTitle}</Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t.quizzes.fieldTitlePlaceholder}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quiz-desc">{t.quizzes.fieldDescription}</Label>
                <Input
                  id="quiz-desc"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t.quizzes.fieldDescriptionPlaceholder}
                />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="quiz-public" checked={isPublic} onCheckedChange={(v) => setIsPublic(Boolean(v))} />
              <div className="grid gap-1">
                <Label htmlFor="quiz-public">{t.quizzes.makePublic}</Label>
                <p className="text-xs text-muted-foreground">{t.quizzes.makePublicHint}</p>
              </div>
            </div>
            <div className="space-y-3">
              <SectionHeading title={t.quizzes.selectWords} />
              <WordPicker
                words={wordsQuery.data?.words}
                isLoading={wordsQuery.isLoading}
                isError={wordsQuery.isError}
                onRetry={() => wordsQuery.refetch()}
                selected={selected}
                onToggle={(id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border p-4 sm:px-6">
            <Button className="w-full sm:w-auto" disabled={mutation.isPending} onClick={onSubmit}>
              {mutation.isPending ? t.quizzes.creating : t.quizzes.create}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
