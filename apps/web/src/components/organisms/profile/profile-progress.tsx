"use client";

import { ExamCountdown } from "@/components/organisms/goal/exam-countdown";
import { MilestonesCard } from "@/components/organisms/milestones/milestones-card";
import { useLearning } from "@/hooks/use-learning";
import { useMockHistory } from "@/hooks/use-mock-history";

/** The exam countdown and milestones, once the learner's summary has loaded. */
export function ProfileProgress() {
  const { summary } = useLearning();
  const history = useMockHistory();
  if (!summary) return null;
  const attempts = history.data ?? [];
  return (
    <div className="space-y-6">
      {summary.goal?.targetLevel ? <ExamCountdown summary={summary} attempts={attempts} /> : null}
      <MilestonesCard summary={summary} attempts={attempts} />
    </div>
  );
}
