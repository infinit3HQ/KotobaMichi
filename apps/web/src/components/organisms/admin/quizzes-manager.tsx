"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { EmptyState } from "@/components/molecules/empty-state";
import { AdminCard } from "@/components/organisms/admin/admin-card";
import { ConfirmDeleteButton } from "@/components/organisms/admin/confirm-delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/organisms/admin/data-table";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { WordPicker } from "@/components/organisms/quizzes/word-picker";
import { api, getApiError } from "@/lib/api";
import type { CreateQuizPayload, QuizDetail, QuizSummary, WordsListResponse } from "@/types/api";

export function QuizzesManager() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes")).data,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/quizzes/${id}`)).data,
    onSuccess: () => {
      toast.success("Quiz deleted");
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to delete"),
  });

  return (
    <AdminCard
      title="Public quizzes"
      description={query.data ? `${query.data.length} quizzes` : "Quizzes everyone can take"}
      action={<CreateQuizDialog onCreated={() => qc.invalidateQueries({ queryKey: ["admin", "quizzes"] })} />}
    >
      {query.isLoading ? (
        <TableSkeleton columns={4} />
      ) : query.isError ? (
        <QueryError title="Couldn't load quizzes" onRetry={() => query.refetch()} retryLabel="Try again" />
      ) : !query.data || query.data.length === 0 ? (
        <EmptyState icon={Layers} title="No public quizzes yet" description="Create one to show it on the quizzes page." />
      ) : (
        <Table className="min-w-[40rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="max-w-[18rem]">
                  <div className="font-medium break-words">{quiz.title}</div>
                  {quiz.description ? (
                    <div className="line-clamp-1 text-xs text-muted-foreground">{quiz.description}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">{quiz._count.quizWords ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">{quiz._count.attempts ?? 0}</TableCell>
                <TableCell className="text-muted-foreground">{quiz.creator?.email ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    {/* Editing a quiz is not offered: the API has no update endpoint. */}
                    <ConfirmDeleteButton
                      iconOnly
                      label="Delete quiz"
                      title="Delete this quiz?"
                      description="Learners will no longer be able to take it. This can't be undone."
                      onConfirm={() => remove.mutate(quiz.id)}
                      disabled={remove.isPending}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AdminCard>
  );
}

function CreateQuizDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const wordsQuery = useQuery({
    queryKey: ["admin", "words", { page: 1, limit: 200 }],
    queryFn: async () => (await api.get<WordsListResponse>("/words", { params: { page: 1, limit: 200 } })).data,
    enabled: open,
  });

  const reset = () => {
    setTitle("");
    setDescription("");
    setSelected({});
  };

  const mutation = useMutation({
    mutationFn: async (payload: CreateQuizPayload) => (await api.post<QuizDetail>("/quizzes", payload)).data,
    onSuccess: () => {
      toast.success("Quiz created");
      onCreated();
      setOpen(false);
      reset();
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to create quiz"),
  });

  const wordIds = Object.entries(selected)
    .filter(([, picked]) => picked)
    .map(([id]) => id);
  const canSubmit = title.trim().length > 0 && wordIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create public quiz</DialogTitle>
          <DialogDescription>Public quizzes show up for every learner.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="admin-quiz-title">Title</Label>
              <Input id="admin-quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="admin-quiz-desc">Description</Label>
              <Input
                id="admin-quiz-desc"
                value={description}
                placeholder="Optional"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <WordPicker
            words={wordsQuery.data?.words}
            isLoading={wordsQuery.isLoading}
            isError={wordsQuery.isError}
            onRetry={() => wordsQuery.refetch()}
            selected={selected}
            onToggle={(id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))}
            listClassName="max-h-60"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate({ title: title.trim(), description, isPublic: true, wordIds })}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
