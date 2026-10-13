"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { JLPTLevel } from "@/data/grammar";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import {
  localDay,
  type LearningGrade,
  type LearningSummary,
} from "@/lib/learning";

export function useLearning(level?: JLPTLevel) {
  const { user } = useAuth();
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

  const record = useCallback(
    async (itemKey: string, itemLevel: JLPTLevel, grade: LearningGrade) => {
      if (!user) return;
      await api.post("/learning/reviews", {
        itemKey,
        level: itemLevel,
        grade,
        day: localDay(),
      });
      queryClient.invalidateQueries({ queryKey: ["learning", "summary"] });
    },
    [user, queryClient]
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

  return {
    user,
    summary: summaryQuery.data,
    due: queueQuery.data?.due ?? [],
    ready: !user || (summaryQuery.isFetched && (!level || queueQuery.isFetched)),
    record,
    savePlace,
  };
}
