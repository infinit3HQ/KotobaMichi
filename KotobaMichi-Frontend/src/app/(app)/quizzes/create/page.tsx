"use client";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  WordsListResponse,
  CreateQuizPayload,
  QuizDetail,
} from "@/types/api";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";
import { useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/organisms/protected-route";

export default function QuizCreationPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["words", { page: 1, limit: 200 }],
    queryFn: async () =>
      (
        await api.get<WordsListResponse>("/words", {
          params: { page: 1, limit: 200 },
        })
      ).data,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateQuizPayload) =>
      (await api.post<QuizDetail>("/quizzes", payload)).data,
    onSuccess: (quiz) => {
      toast.success("Quiz created");
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      router.push(`/quizzes/${quiz.id}`);
    },
    onError: () => toast.error("Failed to create quiz"),
  });

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const onSubmit = () => {
    const wordIds = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!title.trim()) return toast.warning("Title is required");
    if (wordIds.length < 1) return toast.warning("Select at least one word");
    mutation.mutate({ title, description, isPublic, wordIds });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a Custom Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My N5 Set"
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="public"
                checked={isPublic}
                onCheckedChange={(v) => setIsPublic(Boolean(v))}
              />
              <Label htmlFor="public">Make public</Label>
            </div>
            <div>
              <p className="font-medium mb-2">Select words</p>
              {isLoading ? (
                <p className="text-muted-foreground">Loading words…</p>
              ) : isError ? (
                <p className="text-destructive">Failed to load words.</p>
              ) : (
                <div className="max-h-80 overflow-auto border rounded-md p-3 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {data?.words.map((w) => (
                    <label
                      key={w.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={!!selected[w.id]}
                        onCheckedChange={() => toggle(w.id)}
                      />
                      <span className="text-sm">
                        {w.hiragana || w.kanji || w.romaji} — {w.english}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button disabled={mutation.isPending} onClick={onSubmit}>
                {mutation.isPending ? "Creating…" : "Create Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
