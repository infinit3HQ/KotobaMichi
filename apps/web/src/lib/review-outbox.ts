import type { JLPTLevel } from "@/data/grammar";
import type { LearningGrade } from "@/lib/learning";

/**
 * Reviews waiting to reach the server: everything a guest grades, plus
 * signed-in reviews that failed because the device was offline or the API
 * was down. They sync through POST /learning/reviews/batch.
 */
export type OutboxReview = {
  itemKey: string;
  level: JLPTLevel;
  grade: LearningGrade;
  day: string;
  reviewedAt: number;
  /** Null for reviews made while signed out. */
  userId: string | null;
};

export const OUTBOX_KEY = "kotoba-review-outbox";
/** Oldest entries drop first past this many. */
export const OUTBOX_LIMIT = 2000;
/** Matches the server's batch limit. */
export const BATCH_SIZE = 500;

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isReview(value: unknown): value is OutboxReview {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.itemKey === "string" &&
    typeof row.level === "string" &&
    typeof row.grade === "string" &&
    typeof row.day === "string" &&
    typeof row.reviewedAt === "number" &&
    (row.userId === null || typeof row.userId === "string")
  );
}

export function readOutbox(store: Storage | null = storage()): OutboxReview[] {
  if (!store) return [];
  try {
    const parsed: unknown = JSON.parse(store.getItem(OUTBOX_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

export function writeOutbox(rows: OutboxReview[], store: Storage | null = storage()) {
  if (!store) return;
  try {
    store.setItem(OUTBOX_KEY, JSON.stringify(rows.slice(-OUTBOX_LIMIT)));
  } catch {
    // Storage full or blocked. The review is lost, same as before the outbox existed.
  }
}

export function enqueueReview(review: OutboxReview, store: Storage | null = storage()) {
  writeOutbox([...readOutbox(store), review], store);
}

/** Entries this user may sync: their own and any made while signed out. */
export function syncableFor(rows: OutboxReview[], userId: string) {
  return rows.filter((row) => row.userId === null || row.userId === userId);
}

/** Entries that count toward this learner's local schedule. */
export function reviewsFor(rows: OutboxReview[], userId: string | null) {
  return userId ? syncableFor(rows, userId) : rows.filter((row) => row.userId === null);
}

export type SendBatch = (
  reviews: Omit<OutboxReview, "userId">[]
) => Promise<"sent" | "rejected" | "retry">;

let flushing: Promise<number> | null = null;

function outboxKey(row: OutboxReview) {
  return `${row.userId ?? ""}|${row.itemKey}|${row.reviewedAt}`;
}

/**
 * Sends this user's queued reviews in batches, oldest first.
 * "rejected" (a 4xx) drops the batch so a bad entry can't block the queue.
 * "retry" stops and keeps the rest for next time. Returns how many were removed.
 */
export function flushOutbox(userId: string, send: SendBatch, store: Storage | null = storage()) {
  if (flushing) return flushing;
  flushing = (async () => {
    let removed = 0;
    for (;;) {
      const rows = readOutbox(store);
      const batch = syncableFor(rows, userId).slice(0, BATCH_SIZE);
      if (batch.length === 0) break;
      const result = await send(
        batch.map((row) => ({
          itemKey: row.itemKey,
          level: row.level,
          grade: row.grade,
          day: row.day,
          reviewedAt: row.reviewedAt,
        }))
      );
      if (result === "retry") break;
      const sent = new Set(batch.map(outboxKey));
      // Re-read so reviews queued during the request are kept.
      const latest = readOutbox(store);
      const keep = latest.filter((row) => !sent.has(outboxKey(row)));
      removed += latest.length - keep.length;
      writeOutbox(keep, store);
    }
    return removed;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}
