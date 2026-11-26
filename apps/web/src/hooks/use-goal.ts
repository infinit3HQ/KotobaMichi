"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LearningGoal, LearningSummary } from "@/lib/learning";

export type GoalUpdate = Partial<LearningGoal>;

/** Saves the exam goal and email settings, with the browser's UTC offset for reminder timing. */
export function useSaveGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: GoalUpdate) => {
      const tzOffsetMinutes = -new Date().getTimezoneOffset();
      const response = await api.put<LearningGoal>("/learning/goal", { ...update, tzOffsetMinutes });
      return response.data;
    },
    onSuccess: (goal) => {
      queryClient.setQueriesData<LearningSummary>({ queryKey: ["learning", "summary"] }, (current) =>
        current ? { ...current, goal } : current
      );
    },
  });
}
