"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { JLPTLevel } from "@/data/grammar";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  localDay,
  type LearningGrade,
  type LearningSummary,
} from "@/lib/learning";
import {
  enqueueReview,
  flushOutbox,
  readOutbox,
  reviewsFor,
  type OutboxReview,
  type SendBatch,
} from "@/lib/review-outbox";
import { localDueQueue } from "@/lib/srs";

/** Network errors, 5xx, 429, and auth failures are worth retrying later. Other 4xx are not. */
function shouldRetry(error: unknown) {
  if (!axios.isAxiosError(error)) return true;
  const status = error.response?.status;
  if (status == null) return true;
  return status >= 500 || status === 429 || status === 401 || status === 403;
}

const sendBatch: SendBatch = async (reviews) => {
  try {
    await api.post("/learning/reviews/batch", { reviews });
    return "sent";
  } catch (error) {
    return shouldRetry(error) ? "retry" : "rejected";
  }
};

export function useLearning(level?: JLPTLevel) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const day = localDay();
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["learning", "summary", day],
    enabled: !!user,
    queryFn: async () =>
      (await api.get<LearningSummary>(`/learning/summary?day=${day}`)).data,
  });

  const queueQuery = useQuery({
    queryKey: ["learning", "queue", level, day],
    enabled: !!user && !!level,
    queryFn: async () =>
      (await api.get<{ due: string[] }>(`/learning/queue?level=${level}`)).data,
  });

  // Push queued reviews (guest history after sign-in, or offline reviews) to the server.
  useEffect(() => {
    if (!userId) return;
    const flush = () => {
      void flushOutbox(userId, sendBatch).then((removed) => {
        if (removed > 0) queryClient.invalidateQueries({ queryKey: ["learning"] });
      });
    };
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [userId, queryClient]);

  const record = useCallback(
    async (itemKey: string, itemLevel: JLPTLevel, grade: LearningGrade) => {
      const review = { itemKey, level: itemLevel, grade, day: localDay(), reviewedAt: Date.now() };
      if (!userId) {
        enqueueReview({ ...review, userId: null });
        return;
      }
      try {
        await api.post("/learning/reviews", {
          itemKey: review.itemKey,
          level: review.level,
          grade: review.grade,
          day: review.day,
        });
        queryClient.invalidateQueries({ queryKey: ["learning", "summary"] });
      } catch (error) {
        if (!shouldRetry(error)) throw error;
        enqueueReview({ ...review, userId });
      }
    },
    [userId, queryClient]
  );

  const savePlace = useCallback(
    async (place: {
      level: JLPTLevel;
      mode: string;
      itemKey?: string;
      cursor: number;
    }) => {
      if (!user) return;
      await api.put("/learning/place", place);
      queryClient.setQueryData<LearningSummary>(["learning", "summary", day], (current) => {
        if (!current) return current;
        return {
          ...current,
          place: {
            level: place.level,
            mode: place.mode,
            itemKey: place.itemKey ?? null,
            cursor: place.cursor,
          },
          bookmarks: {
            ...current.bookmarks,
            [place.level]: {
              mode: place.mode,
              itemKey: place.itemKey ?? null,
              cursor: place.cursor,
            },
          },
        };
      });
    },
    [user, queryClient, day]
  );

  // Read the outbox once per level and session, not on every grade,
  // so the deck a learner is working through doesn't reshuffle under them.
  // It runs after mount because localStorage doesn't exist during server render.
  const [pending, setPending] = useState<OutboxReview[] | null>(null);
  useEffect(() => {
    setPending(reviewsFor(readOutbox(), userId));
  }, [level, userId]);

  const serverDue = queueQuery.data?.due;
  const due = useMemo(() => {
    if (!level || !pending) return [];
    if (!userId) return localDueQueue(pending, level);
    if (!serverDue) return [];
    const reviewedOffline = new Set(pending.map((row) => row.itemKey));
    return serverDue.filter((itemKey) => !reviewedOffline.has(itemKey));
  }, [level, userId, serverDue, pending]);

  return {
    user,
    summary: summaryQuery.data,
    due,
    ready: user
      ? summaryQuery.isFetched && (!level || queueQuery.isFetched) && pending !== null
      : pending !== null,
    record,
    savePlace,
  };
}
