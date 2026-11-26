"use client";

import { useMemo } from "react";
import { ExamCountdown } from "@/components/organisms/goal/exam-countdown";
import { LearningPath } from "@/components/organisms/learning-path";
import { useMilestoneToasts } from "@/components/organisms/milestones/milestones-card";
import { TodayPlan, TodayPlanSkeleton } from "@/components/organisms/today/today-plan";
import { useLearning } from "@/hooks/use-learning";
import { useMockHistory } from "@/hooks/use-mock-history";
import { drillForSection, predictPass } from "@/lib/exam-plan";
import { milestones } from "@/lib/milestones";
import { planLevel } from "@/lib/today";

/** Today's plan, the road to the exam and level progress, for a signed-in learner. */
export function SignedInHome() {
  const { summary, ready } = useLearning();
  const history = useMockHistory();
  const attempts = useMemo(() => history.data ?? [], [history.data]);

  const weakDrill = useMemo(() => {
    if (!summary) return null;
    return drillForSection(predictPass(attempts, planLevel(summary))?.weakest ?? null);
  }, [summary, attempts]);

  const earned = useMemo(
    () => (summary && history.isFetched ? milestones(summary, attempts) : null),
    [summary, attempts, history.isFetched]
  );
  useMilestoneToasts(earned);

  if (!summary) return ready ? <LearningPath compact /> : <TodayPlanSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <TodayPlan summary={summary} weakDrill={weakDrill} />
        {summary.goal?.targetLevel ? <ExamCountdown summary={summary} attempts={attempts} /> : null}
      </div>
      <LearningPath compact />
    </div>
  );
}
