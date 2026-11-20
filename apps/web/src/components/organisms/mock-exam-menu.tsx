"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/atoms/button";
import type { MockExam } from "@/lib/mock-exam";
import { nextSuggestedSection } from "@/lib/mock-sitting";

function SectionCards({
  exam,
  completed,
  suggested,
  onOpen,
}: {
  exam: MockExam;
  completed: readonly string[];
  suggested: number | null;
  onOpen: (index: number) => void;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {exam.sections.map((section, index) => {
        const done = completed.includes(section.id);
        return (
          <li
            key={section.id}
            className={`flex flex-col rounded-2xl border bg-card p-4 ${
              index === suggested ? "border-primary/60" : "border-border"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Section {index + 1}
            </p>
            <p className="mt-1 font-jp text-lg font-semibold">{section.title}</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{section.minutes}:00</p>
            <div className="mt-4 flex-1" />
            {done ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check className="h-4 w-4" aria-hidden />
                Done
              </p>
            ) : (
              <Button
                type="button"
                variant={index === suggested ? "default" : "outline"}
                className="w-full rounded-full"
                onClick={() => onOpen(index)}
              >
                Start this section
              </Button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function MockExamBrief({
  exam,
  signedIn,
  onBegin,
}: {
  exam: MockExam;
  signedIn: boolean;
  onBegin: (index: number) => void;
}) {
  const first = exam.sections[0];
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <p className="font-jp text-sm text-primary">模擬試験</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{exam.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{exam.note}</p>
      </div>
      <SectionCards exam={exam} completed={[]} suggested={0} onOpen={onBegin} />
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>Take the sections in the paper’s order or pick any one. Each runs on its own clock.</li>
        <li>A section locks when its clock ends or you close it. Leftover time does not move forward.</li>
        <li>The total out of 180 and the pass line appear once all three sections are done.</li>
        <li>Answers stay hidden until the sitting is over.</li>
        <li>
          {signedIn
            ? "This sitting, including every answer, is saved on your account."
            : "Sign in before you start if you want the score and the paper kept."}
        </li>
      </ul>
      {first && (
        <Button type="button" size="lg" className="rounded-full px-6" onClick={() => onBegin(0)}>
          Start the full paper · {first.title} {first.minutes}:00
        </Button>
      )}
    </div>
  );
}

export function MockSectionMenu({
  exam,
  completed,
  onOpen,
  onEnd,
}: {
  exam: MockExam;
  completed: readonly string[];
  onOpen: (index: number) => void;
  onEnd: () => void;
}) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const suggested = nextSuggestedSection(exam, completed);
  const next = suggested == null ? null : exam.sections[suggested];
  const left = exam.sections.filter((section) => !completed.includes(section.id));

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <p className="font-jp text-sm text-primary">模擬試験</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{exam.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {completed.length} of {exam.sections.length} sections done. Pick the next one, or end the sitting to see
          your scores.
        </p>
      </div>
      <SectionCards exam={exam} completed={completed} suggested={suggested} onOpen={onOpen} />
      <div className="flex flex-wrap items-center gap-2">
        {next && suggested != null && (
          <Button type="button" size="lg" className="rounded-full px-6" onClick={() => onOpen(suggested)}>
            Continue · {next.title} {next.minutes}:00
          </Button>
        )}
        {completed.length > 0 && !confirmEnd && (
          <Button type="button" variant="ghost" onClick={() => setConfirmEnd(true)}>
            End sitting
          </Button>
        )}
      </div>
      {confirmEnd && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            End now? <span className="font-jp">{left.map((section) => section.title).join("、")}</span> will not be
            scored, and there is no total out of 180 without all three.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirmEnd(false)}>
              Keep going
            </Button>
            <Button type="button" onClick={onEnd}>
              See results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
