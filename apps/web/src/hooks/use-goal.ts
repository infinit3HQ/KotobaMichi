"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LearningGoal, LearningSummary } from "@/lib/learning";
import { setPersonProperties, track } from "@/lib/analytics/posthog";

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
    onSuccess: (goal, update) => {
      track("exam_goal_saved", { fields: Object.keys(update) });
      setPersonProperties({
        exam_target_level: goal.targetLevel,
        exam_date: goal.examDate,
        daily_goal: goal.dailyGoal,
        reminders_enabled: goal.remindersEnabled,
        weekly_recap: goal.weeklyRecap,
      });
      queryClient.setQueriesData<LearningSummary>({ queryKey: ["learning", "summary"] }, (current) =>
        current ? { ...current, goal } : current
      );
    },
  });
}
