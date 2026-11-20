"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
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
import { EMPTY_WORD, WordFormDialog, type WordFormValues } from "@/components/organisms/admin/word-form-dialog";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { api, getApiError } from "@/lib/api";
import type { Word, WordsListResponse } from "@/types/api";

const LIMIT = 20;

function toFormValues(word: Word): WordFormValues {
  return {
    kanji: word.kanji,
    hiragana: word.hiragana,
    romaji: word.romaji,
    english: word.english,
    pronunciationUrl: word.pronunciationUrl,
    level: word.level,
    createdAt: word.createdAt,
  };
}

function useWordMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "words"] });
  const fail = (fallback: string) => (e: unknown) => toast.error(getApiError(e).message ?? fallback);

  const create = useMutation({
    mutationFn: async (payload: WordFormValues) => (await api.post<Word>("/words", payload)).data,
    onSuccess: () => {
      toast.success("Word added");
      refresh();
    },
    onError: fail("Failed to add"),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Word> }) =>
      (await api.patch<Word>(`/words/${id}`, data)).data,
    onSuccess: () => {
      toast.success("Word updated");
      refresh();
    },
    onError: fail("Failed to update"),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/words/${id}`)).data,
    onSuccess: () => {
      toast.success("Word deleted");
      refresh();
    },
    onError: fail("Failed to delete"),
  });
  return { create, update, remove };
}

export function WordsManager() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin", "words", { page, limit: LIMIT }],
    queryFn: async () => (await api.get<WordsListResponse>("/words", { params: { page, limit: LIMIT } })).data,
  });
  const { create, update, remove } = useWordMutations();
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <AdminCard
      title="Words"
      description={pagination ? `${pagination.total} words in the dictionary` : "Vocabulary used across the app"}
      action={
        <WordFormDialog
          title="Add word"
          initial={EMPTY_WORD}
          submitting={create.isPending}
          onSubmit={(values) => create.mutate(values)}
          trigger={
            <Button>
              <Plus />
              Add word
            </Button>
          }
        />
      }
    >
      {query.isLoading ? (
        <TableSkeleton columns={4} />
      ) : query.isError ? (
        <QueryError title="Couldn't load words" onRetry={() => query.refetch()} retryLabel="Try again" />
      ) : !query.data || query.data.words.length === 0 ? (
        <EmptyState icon={BookOpen} title="No words yet" description="Add a word or import a CSV file." />
      ) : (
        <div className="space-y-3">
          <Table className="min-w-[40rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>English</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.words.map((word) => (
                <TableRow key={word.id}>
                  <TableCell>
                    <div lang="ja" className="font-jp font-medium">
                      {word.kanji || word.hiragana || word.romaji}
                    </div>
                    {word.kanji ? <div className="font-jp text-xs text-muted-foreground">{word.hiragana}</div> : null}
                  </TableCell>
                  <TableCell className="max-w-[16rem]">{word.english}</TableCell>
                  <TableCell>{word.level ? <Badge variant="secondary">{word.level}</Badge> : "—"}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground" title={word.pronunciationUrl}>
                    {word.pronunciationUrl || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <WordFormDialog
                        title="Edit word"
                        initial={toFormValues(word)}
                        submitting={update.isPending}
                        onSubmit={(data) => update.mutate({ id: word.id, data })}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit word">
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDeleteButton
                        iconOnly
                        label="Delete word"
                        title="Delete this word?"
                        description="This removes it from the dictionary. This can't be undone."
                        onConfirm={() => remove.mutate(word.id)}
                        disabled={remove.isPending}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground tabular-nums">
              Page {pagination?.page ?? page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
