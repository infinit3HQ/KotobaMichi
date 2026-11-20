"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import type { MockExam } from "@/lib/mock-exam";
import { nextSuggestedSection } from "@/lib/mock-sitting";
import { cn } from "@/lib/utils";

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
    <ol className="grid gap-4 sm:grid-cols-3">
      {exam.sections.map((section, index) => {
        const done = completed.includes(section.id);
        const isNext = index === suggested;
        return (
          <li key={section.id}>
            <Card className={cn("h-full gap-0 py-0", isNext && !done && "border-primary/50", done && "bg-muted/40")}>
              <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Section {index + 1}</p>
                  {done ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check aria-hidden />
                      Done
                    </Badge>
                  ) : isNext ? (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      Next
                    </Badge>
                  ) : null}
                </div>
                <p className="font-jp font-semibold tracking-tight">{section.title}</p>
                <p
                  className={cn(
                    "font-mono text-2xl font-semibold tabular-nums tracking-tight",
                    done && "text-muted-foreground"
                  )}
                >
                  {section.minutes}:00
                </p>
                <div className="mt-auto pt-1">
                  {done ? (
                    <p className="text-sm text-muted-foreground">Closed and saved for scoring.</p>
                  ) : (
                    <Button
                      type="button"
                      variant={isNext ? "default" : "outline"}
                      className="w-full"
                      onClick={() => onOpen(index)}
                    >
                      Start this section
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

const BRIEF_RULES = [
  "Take the sections in the paper’s order or pick any one. Each runs on its own clock.",
  "A section locks when its clock ends or you close it. Leftover time does not move forward.",
  "The total out of 180 and the pass line appear once all three sections are done.",
  "Answers stay hidden until the sitting is over.",
];

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
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="模擬試験"
        title={exam.title}
        description={exam.note}
        actions={
          first ? (
            <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => onBegin(0)}>
              <Play />
              Start the full paper
            </Button>
          ) : null
        }
      />
      <section className="space-y-3">
        <SectionHeading title="Sections" meta="Or start any one on its own" />
        <SectionCards exam={exam} completed={[]} suggested={0} onOpen={onBegin} />
      </section>
      <section className="space-y-3">
        <SectionHeading title="How the sitting works" />
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-border">
          {BRIEF_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
          <li>
            {signedIn
              ? "This sitting, including every answer, is saved on your account."
              : "Sign in before you start if you want the score and the paper kept."}
          </li>
        </ul>
      </section>
    </div>
  );
}

function EndSittingConfirm({
  left,
  onCancel,
  onEnd,
}: {
  left: readonly string[];
  onCancel: () => void;
  onEnd: () => void;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm">
          End now? <span className="font-jp">{left.join("、")}</span> will not be scored, and there is no total out of
          180 without all three.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={onCancel}>
            Keep going
          </Button>
          <Button type="button" className="flex-1 sm:flex-none" onClick={onEnd}>
            See results
          </Button>
        </div>
      </CardContent>
    </Card>
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
  const left = exam.sections.filter((section) => !completed.includes(section.id)).map((section) => section.title);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="模擬試験"
        title={exam.title}
        description={`${completed.length} of ${exam.sections.length} sections done. Pick the next one, or end the sitting to see your scores.`}
        actions={
          <>
            {next && suggested != null && (
              <Button type="button" onClick={() => onOpen(suggested)}>
                <Play />
                Continue · <span className="font-jp">{next.title}</span>
              </Button>
            )}
            {completed.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setConfirmEnd(true)} disabled={confirmEnd}>
                End sitting
              </Button>
            )}
          </>
        }
      />
      {confirmEnd && <EndSittingConfirm left={left} onCancel={() => setConfirmEnd(false)} onEnd={onEnd} />}
      <SectionCards exam={exam} completed={completed} suggested={suggested} onOpen={onOpen} />
    </div>
  );
}
