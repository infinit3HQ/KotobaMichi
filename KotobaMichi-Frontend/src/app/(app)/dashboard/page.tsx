"use client";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Checkbox } from "@/components/atoms/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  getApiError,
  uploadCsv,
  fetchImportStats,
  clearAllWords,
} from "@/lib/api";
import type {
  WordsListResponse,
  Word,
  QuizSummary,
  QuizDetail,
  CreateQuizPayload,
} from "@/types/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/atoms/progress";

export default function DashboardPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage vocabulary and public quizzes.
        </p>
        <Tabs defaultValue="words" className="w-full">
          <TabsList>
            <TabsTrigger value="words">Vocabulary</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="import">CSV Import</TabsTrigger>
          </TabsList>
          <TabsContent value="words" className="space-y-4">
            <WordsManager />
          </TabsContent>
          <TabsContent value="quizzes" className="space-y-4">
            <QuizzesManager />
          </TabsContent>
          <TabsContent value="import" className="space-y-4">
            <CsvImportManager />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

function WordsManager() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "words", { page, limit }],
    queryFn: async () =>
      (await api.get<WordsListResponse>("/words", { params: { page, limit } }))
        .data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<Word, "id">) =>
      (await api.post<Word>("/words", payload)).data,
    onSuccess: () => {
      toast.success("Word added");
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to add"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Word> }) =>
      (await api.patch<Word>(`/words/${id}`, data)).data,
    onSuccess: () => {
      toast.success("Word updated");
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/words/${id}`)).data,
    onSuccess: () => {
      toast.success("Word deleted");
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to delete"),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Words</CardTitle>
        <CreateWordDialog
          onSubmit={(w) => createMutation.mutate(w)}
          submitting={createMutation.isPending}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : isError ? (
          <p className="text-destructive">Failed to load words.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Kana/Kanji</th>
                  <th className="p-2">English</th>
                  <th className="p-2">English</th>
                  <th className="p-2">Audio</th>
                  <th className="p-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.words.map((w) => (
                  <tr key={w.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">
                        {w.hiragana || w.kanji || w.romaji}
                        {w.hiragana || w.kanji || w.romaji}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {w.kanji}
                      </div>
                    </td>
                    <td className="p-2">{w.english}</td>
                    <td className="p-2">{w.english}</td>
                    <td className="p-2 truncate max-w-[12rem]">
                      {w.pronunciationUrl}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <EditWordDialog
                          word={w}
                          onSubmit={(data) =>
                            updateMutation.mutate({ id: w.id, data })
                          }
                          submitting={updateMutation.isPending}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this word?"))
                              deleteMutation.mutate(w.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-muted-foreground">
                Page {data?.pagination.page} of {data?.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={
                    data?.pagination.page === data?.pagination.totalPages
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateWordDialog({
  onSubmit,
  submitting,
}: {
  onSubmit: (w: Omit<Word, "id">) => void;
  submitting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Word, "id">>({
    kanji: "",
    hiragana: "",
    romaji: "",
    english: "",
    pronunciationUrl: "",
    level: "",
    createdAt: new Date().toISOString(),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add word</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Word</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <LabeledInput label="Kanji" value={form.kanji ?? ""} onChange={(v) => setForm({ ...form, kanji: v })} />
          <LabeledInput label="Hiragana" value={form.hiragana ?? ""} onChange={(v) => setForm({ ...form, hiragana: v })} />
          <LabeledInput label="Romaji" value={form.romaji ?? ""} onChange={(v) => setForm({ ...form, romaji: v })} />
          <LabeledInput label="English" value={form.english} onChange={(v) => setForm({ ...form, english: v })} />
          <LabeledInput label="Pronunciation URL" value={form.pronunciationUrl ?? ""} onChange={(v) => setForm({ ...form, pronunciationUrl: v })} />
          <LabeledInput label="Level" value={form.level ?? ""} onChange={(v) => setForm({ ...form, level: v })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(form);
              setOpen(false);
            }}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditWordDialog({
  word,
  onSubmit,
  submitting,
}: {
  word: Word;
  onSubmit: (w: Partial<Word>) => void;
  submitting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Word>>({ ...word });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <LabeledInput label="Kanji" value={form.kanji ?? ""} onChange={(v) => setForm({ ...form, kanji: v })} />
          <LabeledInput label="Hiragana" value={form.hiragana ?? ""} onChange={(v) => setForm({ ...form, hiragana: v })} />
          <LabeledInput label="Romaji" value={form.romaji ?? ""} onChange={(v) => setForm({ ...form, romaji: v })} />
          <LabeledInput label="English" value={form.english ?? ""} onChange={(v) => setForm({ ...form, english: v })} />
          <LabeledInput label="Pronunciation URL" value={form.pronunciationUrl ?? ""} onChange={(v) => setForm({ ...form, pronunciationUrl: v })} />
          <LabeledInput label="Level" value={form.level ?? ""} onChange={(v) => setForm({ ...form, level: v })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(form);
              setOpen(false);
            }}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CsvImportManager() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(false);

  const {
    data: stats,
    refetch: refetchStats,
    isFetching: statsLoading,
  } = useQuery({
    queryKey: ["admin", "import", "stats"],
    queryFn: fetchImportStats,
  });

  const uploadMutation = useMutation({
    mutationFn: async (f: File) => {
      setProgress(10);
      const res = await uploadCsv(f);
      setProgress(100);
      return res;
    },
    onSuccess: (res) => {
      toast.success(
        `Imported ${res.imported}/${res.total}. Duplicates: ${res.duplicates}`
      );
      setFile(null);
      refetchStats();
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
      // Trigger periodic auto-refresh for a short window after successful upload
      setAutoRefreshActive(true);
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Upload failed"),
    onSettled: () => setProgress(0),
  });

  const clearMutation = useMutation({
    mutationFn: clearAllWords,
    onSuccess: (res) => {
      toast.success(`Cleared ${res.deletedCount} words`);
      refetchStats();
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Clear failed"),
  });

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragActive) setDragActive(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  // Periodic auto-refresh of stats for 30s after an upload, every 5s
  useEffect(() => {
    if (!autoRefreshActive) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed > 30_000) {
        clearInterval(interval);
        setAutoRefreshActive(false);
        return;
      }
      refetchStats();
    }, 5_000);
    return () => clearInterval(interval);
  }, [autoRefreshActive, refetchStats]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CSV Import</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Clear ALL words?")) clearMutation.mutate();
            }}
            disabled={clearMutation.isPending}
          >
            {clearMutation.isPending ? "Clearing…" : "Clear All Words"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label>Upload CSV</Label>
          <Input type="file" accept=".csv,text/csv" onChange={onSelect} />
          <div
            className={`mt-2 flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role="button"
            aria-label="Drag and drop CSV file here"
            tabIndex={0}
          >
            <span className="font-medium">Drag & drop CSV file here</span>
            <span className="text-sm text-muted-foreground">
              or use the file picker above
            </span>
            {file && (
              <span className="mt-2 text-xs text-muted-foreground">
                Selected: {file.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={onUpload}
              disabled={!file || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
            <a
              className="text-sm underline text-primary"
              href="/csv-example.csv"
              download
            >
              Download CSV example
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            CSV format: columns Kanji (optional), Hiragana (required), English
            (required), PronunciationURL (required). UTF-8 without BOM
            recommended.
          </p>

          {uploadMutation.isPending && (
            <div className="pt-2">
              <Progress value={progress} />
            </div>
          )}
          {uploadMutation.data && (
            <div className="text-sm text-muted-foreground">
              Imported: {uploadMutation.data.imported}/
              {uploadMutation.data.total} — Duplicates:{" "}
              {uploadMutation.data.duplicates} — Errors:{" "}
              {uploadMutation.data.errors}
            </div>
          )}

          {/* Error details table */}
          {uploadMutation.data && uploadMutation.data.errors > 0 && (
            <div className="overflow-x-auto">
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2 w-24">Row</th>
                    <th className="p-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadMutation.data.errorDetails?.map((err, idx) => {
                    const row = typeof err === "string" ? undefined : err.row;
                    const msg = typeof err === "string" ? err : err.message;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{row ?? "-"}</td>
                        <td className="p-2 whitespace-pre-wrap">{msg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Import Stats</Label>
          {statsLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : stats ? (
            <ul className="text-sm">
              <li>
                Total Words:{" "}
                <span className="font-medium">{stats.totalWords}</span>
              </li>
              <li>
                Recent Imports:{" "}
                <span className="font-medium">{stats.recentImports}</span>
              </li>
              <li>
                Last Import Time:{" "}
                <span className="font-medium">
                  {new Date(stats.lastImportTime).toLocaleString()}
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-muted-foreground">No stats available.</p>
          )}
          {autoRefreshActive && (
            <p className="text-xs text-muted-foreground">
              Auto-refreshing stats for 30 seconds…
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizzesManager() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: async () => (await api.get<QuizSummary[]>("/quizzes")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/quizzes/${id}`)).data,
    onSuccess: () => {
      toast.success("Quiz deleted");
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Failed to delete"),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Public Quizzes</CardTitle>
        <CreateQuizDialog
          onCreated={() =>
            qc.invalidateQueries({ queryKey: ["admin", "quizzes"] })
          }
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : isError ? (
          <p className="text-destructive">Failed to load quizzes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Words</th>
                  <th className="p-2">Attempts</th>
                  <th className="p-2">Creator</th>
                  <th className="p-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((q) => (
                  <tr key={q.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{q.title}</div>
                      {q.description && (
                        <div className="text-xs text-muted-foreground">
                          {q.description}
                        </div>
                      )}
                    </td>
                    <td className="p-2">{q._count.quizWords ?? 0}</td>
                    <td className="p-2">{q._count.attempts ?? 0}</td>
                    <td className="p-2">{q.creator?.email}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {/* Edit quiz not implemented - API lacks endpoint */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this quiz?"))
                              deleteMutation.mutate(q.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateQuizDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data: wordsData } = useQuery({
    queryKey: ["admin", "words", { page: 1, limit: 200 }],
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
    onSuccess: () => {
      toast.success("Quiz created");
      onCreated();
      setOpen(false);
      setTitle("");
      setDescription("");
      setSelected({});
    },
    onError: (e) =>
      toast.error(getApiError(e).message ?? "Failed to create quiz"),
  });

  const wordIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );
  const canSubmit = title.trim().length > 0 && wordIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create quiz</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Public Quiz</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <LabeledInput label="Title" value={title} onChange={setTitle} />
          <LabeledInput
            label="Description"
            value={description}
            onChange={setDescription}
          />
          <div>
            <Label>Select words</Label>
            <div className="mt-2 max-h-60 overflow-auto rounded-md border p-2 grid sm:grid-cols-2 gap-2">
              {wordsData?.words.map((w) => (
                <label key={w.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!selected[w.id]}
                    onCheckedChange={() =>
                      setSelected((s) => ({ ...s, [w.id]: !s[w.id] }))
                    }
                  />
                  <span>
                    {w.hiragana || w.kanji || w.romaji} — {w.english}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              mutation.mutate({ title, description, isPublic: true, wordIds })
            }
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </div>
  );
}
