"use client";

import { FeatureGrid } from "@/components/organisms/home/feature-grid";
import { SignedInHome } from "@/components/organisms/home/signed-in-home";
import { useLearning } from "@/hooks/use-learning";
import { useLoopText } from "@/hooks/use-loop-text";

/** The home page for a signed-in learner: today's work first, no sales pitch. */
export function LearnerHome() {
  const text = useLoopText();
  const { summary } = useLearning();
  const isNew = summary != null && summary.levels.every((row) => row.seen === 0) && (summary.mistakesTotal ?? 0) === 0;

  return (
    <div className="space-y-10 pb-4 sm:space-y-12">
      <header className="space-y-1 pt-2">
        <h1 className="font-jp text-2xl font-semibold tracking-tight sm:text-3xl">{isNew ? text.home.greetingNew : text.home.greeting}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{text.home.subtitle}</p>
      </header>
      <SignedInHome />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{text.home.explore}</h2>
        <FeatureGrid compact />
      </section>
    </div>
  );
}
