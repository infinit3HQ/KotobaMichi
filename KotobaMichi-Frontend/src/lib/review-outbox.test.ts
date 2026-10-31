import { describe, expect, it } from "vitest";
import {
  BATCH_SIZE,
  enqueueReview,
  flushOutbox,
  OUTBOX_KEY,
  OUTBOX_LIMIT,
  readOutbox,
  reviewsFor,
  type OutboxReview,
  type SendBatch,
} from "@/lib/review-outbox";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

function review(itemKey: string, reviewedAt: number, userId: string | null = null): OutboxReview {
  return { itemKey, level: "N5", grade: "good", day: "2026-10-30", reviewedAt, userId };
}

describe("review outbox", () => {
  it("ignores corrupt storage", () => {
    const store = memoryStore();
    store.setItem(OUTBOX_KEY, "{not json");
    expect(readOutbox(store)).toEqual([]);
    store.setItem(OUTBOX_KEY, JSON.stringify([{ itemKey: 1 }, review("w-1", 1)]));
    expect(readOutbox(store)).toEqual([review("w-1", 1)]);
  });

  it("keeps only the newest entries past the limit", () => {
    const store = memoryStore();
    for (let i = 0; i < OUTBOX_LIMIT + 5; i += 1) enqueueReview(review(`w-${i}`, i), store);
    const rows = readOutbox(store);
    expect(rows).toHaveLength(OUTBOX_LIMIT);
    expect(rows[0]?.itemKey).toBe("w-5");
  });

  it("never hands one user's queued reviews to another", () => {
    const rows = [review("guest", 1), review("mine", 2, "u1"), review("theirs", 3, "u2")];
    expect(reviewsFor(rows, "u1").map((row) => row.itemKey)).toEqual(["guest", "mine"]);
    expect(reviewsFor(rows, null).map((row) => row.itemKey)).toEqual(["guest"]);
  });
});

describe("flushOutbox", () => {
  it("sends in batches and empties the queue", async () => {
    const store = memoryStore();
    for (let i = 0; i < BATCH_SIZE + 10; i += 1) enqueueReview(review(`w-${i}`, i), store);
    const sizes: number[] = [];
    const send: SendBatch = async (batch) => {
      sizes.push(batch.length);
      expect(batch[0]).not.toHaveProperty("userId");
      return "sent";
    };
    expect(await flushOutbox("u1", send, store)).toBe(BATCH_SIZE + 10);
    expect(sizes).toEqual([BATCH_SIZE, 10]);
    expect(readOutbox(store)).toEqual([]);
  });

  it("keeps everything when the server can't be reached", async () => {
    const store = memoryStore();
    enqueueReview(review("w-1", 1), store);
    expect(await flushOutbox("u1", async () => "retry", store)).toBe(0);
    expect(readOutbox(store)).toHaveLength(1);
  });

  it("drops a rejected batch so it can't block the queue", async () => {
    const store = memoryStore();
    enqueueReview(review("w-1", 1), store);
    expect(await flushOutbox("u1", async () => "rejected", store)).toBe(1);
    expect(readOutbox(store)).toEqual([]);
  });

  it("keeps reviews queued while a batch is in flight, and other users' reviews", async () => {
    const store = memoryStore();
    enqueueReview(review("w-1", 1), store);
    enqueueReview(review("other", 2, "u2"), store);
    let calls = 0;
    const send: SendBatch = async () => {
      calls += 1;
      if (calls === 1) enqueueReview(review("w-late", 3, "u1"), store);
      return "sent";
    };
    await flushOutbox("u1", send, store);
    expect(calls).toBe(2);
    expect(readOutbox(store).map((row) => row.itemKey)).toEqual(["other"]);
  });
});
