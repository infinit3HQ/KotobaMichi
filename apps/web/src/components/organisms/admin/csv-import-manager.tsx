"use client";

import { useCallback, useEffect, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Progress } from "@/components/atoms/progress";
import { Skeleton } from "@/components/atoms/skeleton";
import { SectionHeading } from "@/components/molecules/page-header";
import { AdminCard } from "@/components/organisms/admin/admin-card";
import { ConfirmDeleteButton } from "@/components/organisms/admin/confirm-delete-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/organisms/admin/data-table";
import { QueryError } from "@/components/organisms/quizzes/query-error";
import { clearAllWords, fetchImportStats, getApiError, uploadCsv } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CsvImportResponse, ImportStats } from "@/types/api";

const AUTO_REFRESH_MS = 30_000;
const AUTO_REFRESH_EVERY_MS = 5_000;

/** Refetch import stats every 5s for 30s after an upload finishes. */
function useAutoRefresh(active: boolean, refetch: () => void, onDone: () => void) {
  useEffect(() => {
    if (!active) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startedAt > AUTO_REFRESH_MS) {
        clearInterval(interval);
        onDone();
        return;
      }
      refetch();
    }, AUTO_REFRESH_EVERY_MS);
    return () => clearInterval(interval);
  }, [active, refetch, onDone]);
}

export function CsvImportManager() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(false);

  const statsQuery = useQuery({ queryKey: ["admin", "import", "stats"], queryFn: fetchImportStats });
  const refetchStats = statsQuery.refetch;
  const stopAutoRefresh = useCallback(() => setAutoRefreshActive(false), []);
  useAutoRefresh(autoRefreshActive, refetchStats, stopAutoRefresh);

  const upload = useMutation({
    mutationFn: async (f: File) => {
      setProgress(10);
      const res = await uploadCsv(f);
      setProgress(100);
      return res;
    },
    onSuccess: (res) => {
      toast.success(`Imported ${res.imported}/${res.total}. Duplicates: ${res.duplicates}`);
      setFile(null);
      refetchStats();
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
      setAutoRefreshActive(true);
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Upload failed"),
    onSettled: () => setProgress(0),
  });

  const clear = useMutation({
    mutationFn: clearAllWords,
    onSuccess: (res) => {
      toast.success(`Cleared ${res.deletedCount} words`);
      refetchStats();
      qc.invalidateQueries({ queryKey: ["admin", "words"] });
    },
    onError: (e) => toast.error(getApiError(e).message ?? "Clear failed"),
  });

  const stopEvent = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <AdminCard
      title="CSV import"
      description="Add many words at once from a spreadsheet."
      action={
        <ConfirmDeleteButton
          size="default"
          label={clear.isPending ? "Clearing…" : "Clear all words"}
          title="Clear every word?"
          description="This deletes the whole dictionary. This can't be undone."
          confirmLabel="Clear all words"
          onConfirm={() => clear.mutate()}
          disabled={clear.isPending}
        />
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="csv-file">Upload CSV</Label>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={(e) => {
              stopEvent(e);
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              stopEvent(e);
              setDragActive(false);
            }}
            onDrop={(e) => {
              stopEvent(e);
              setDragActive(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) setFile(dropped);
            }}
            aria-label="Drag and drop CSV file here"
          >
            <FileUp className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">Drag a CSV file here, or choose one</p>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              className="w-full sm:w-72"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) setFile(picked);
              }}
            />
            {file ? <p className="text-xs break-all text-muted-foreground">Selected: {file.name}</p> : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Columns: Kanji (optional), Hiragana, English, PronunciationURL. Save as UTF-8 without BOM.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => file && upload.mutate(file)} disabled={!file || upload.isPending}>
              <Upload />
              {upload.isPending ? "Uploading…" : "Upload"}
            </Button>
            <Button asChild variant="outline">
              <a href="/csv-example.csv" download>
                <Download />
                Example CSV
              </a>
            </Button>
          </div>
          {upload.isPending ? <Progress value={progress} aria-label="Upload progress" /> : null}
          {upload.data ? <ImportResult result={upload.data} /> : null}
        </div>

        <div className="space-y-3">
          <SectionHeading
            title="Import stats"
            meta={autoRefreshActive ? "Refreshing for 30 seconds…" : null}
          />
          {statsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3" aria-hidden>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16 bg-muted" />
              ))}
            </div>
          ) : statsQuery.isError ? (
            <QueryError title="Couldn't load import stats" onRetry={() => refetchStats()} retryLabel="Try again" />
          ) : statsQuery.data ? (
            <ImportStatsGrid stats={statsQuery.data} />
          ) : (
            <p className="text-sm text-muted-foreground">No stats available.</p>
          )}
        </div>
      </div>
    </AdminCard>
  );
}

function ImportStatsGrid({ stats }: { stats: ImportStats }) {
  const items = [
    { label: "Total words", value: stats.totalWords.toLocaleString() },
    { label: "Recent imports", value: stats.recentImports.toLocaleString() },
    {
      label: "Last import",
      value: stats.lastImportTime ? new Date(stats.lastImportTime).toLocaleString() : "—",
    },
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border p-3">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ImportResult({ result }: { result: CsvImportResponse }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Imported {result.imported}/{result.total} · Duplicates {result.duplicates} · Errors {result.errors}
      </p>
      {result.errors > 0 && result.errorDetails?.length ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Row</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.errorDetails.map((err, idx) => {
                const row = typeof err === "string" ? undefined : err.row;
                const message = typeof err === "string" ? err : err.message;
                return (
                  <TableRow key={idx}>
                    <TableCell className="tabular-nums">{row ?? "—"}</TableCell>
                    <TableCell className="whitespace-pre-wrap">{message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
