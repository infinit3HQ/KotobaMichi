"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import type { MockMode } from "@/lib/mock-clock";
import {
  type MockExam,
  formatPoints,
  paperPoints,
  PASS_SECTION,
  practicePassTotal,
  responseBand,
  scoreByMondai,
  SECTION_POINTS,
} from "@/lib/mock-exam";
import { summarizeSitting } from "@/lib/mock-sitting";
import { MondaiSheet } from "./mondai-sheet";
import { ResultsActions } from "./results-actions";

type MondaiScore = ReturnType<typeof scoreByMondai>[number];
type SectionSummary = ReturnType<typeof summarizeSitting>["sections"][number];

function passLine(
  passes: boolean | null,
  sectionCount: number,
  passTotal: number,
) {
  const outOf = paperPoints(sectionCount);
  if (passes == null) {
    return `Section scores only. The total out of ${outOf} and the pass line need all ${sectionCount} sections.`;
  }
  return passes
    ? `Above the practice line: ${passTotal} overall and ${PASS_SECTION} in every group.`
    : `Under the practice line. A pass needs ${passTotal} overall and ${PASS_SECTION} in every group.`;
}

function SectionScoreCard({
  score,
  rows,
}: {
  score: SectionSummary;
  rows: MondaiScore[];
}) {
  if (score.points == null) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-muted-foreground sm:p-5">
        <p className="font-jp text-sm">{score.title}</p>
        <p className="mt-2 text-sm">Not taken</p>
      </div>
    );
  }
  const points = score.points;
  const partShares = rows.reduce<Record<string, number>>(
    (acc, row) => ({
      ...acc,
      [row.partTitle]: (acc[row.partTitle] ?? 0) + row.share,
    }),
    {},
  );
  const passed = points >= PASS_SECTION;
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-2 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-jp text-sm font-semibold">{score.title}</p>
          <Badge
            variant={passed ? "secondary" : "outline"}
            className={passed ? "text-chart-3" : "text-destructive"}
          >
            {passed ? `≥ ${PASS_SECTION}` : `< ${PASS_SECTION}`}
          </Badge>
        </div>
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
          {formatPoints(points)}
          <span className="text-base text-muted-foreground">
            /{SECTION_POINTS}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {Object.entries(partShares)
            .map(([title, share]) => `${title} ${formatPoints(share)}`)
            .join(" · ")}
          {" · "}
          {score.correct}/{score.total} marked
        </p>
      </CardContent>
    </Card>
  );
}

function MondaiTable({ rows }: { rows: MondaiScore[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">問題</th>
              <th className="px-4 py-2 text-right font-medium">Marked</th>
              <th className="px-4 py-2 text-right font-medium">Share of 60</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.sectionId}-${row.partTitle}-${row.mondai}`}
                className="border-t border-border"
              >
                <td className="px-4 py-2">
                  <span className="font-jp">{row.partTitle}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    問題{row.mondai}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {row.correct}/{row.total}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {formatPoints(row.earned)}/{formatPoints(row.share)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatPoints(row.total > 0 ? row.share / row.total : 0)}{" "}
                    each
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Scores for a finished sitting, with the marked paper behind a toggle. */
export function MockResults({
  exam,
  answers,
  completed,
  signedIn,
  mode,
  onAgain,
}: {
  exam: MockExam;
  answers: Record<string, number>;
  completed: readonly string[];
  signedIn: boolean;
  mode: MockMode;
  onAgain: () => void;
}) {
  const [open, setOpen] = useState(false);
  const summary = summarizeSitting(exam, answers, completed);
  const taken = summary.sections.filter((section) => section.taken);
  // Untaken sections stay unscored and unrevealed, so they can still be practised later.
  const mondaiScores = scoreByMondai(exam, answers).filter((row) =>
    completed.includes(row.sectionId),
  );
  const areas = ["文字・語彙", "文法"]
    .map((title) => {
      const rows = mondaiScores.filter((row) => row.partTitle === title);
      const correct = rows.reduce((sum, row) => sum + row.correct, 0);
      const total = rows.reduce((sum, row) => sum + row.total, 0);
      return { title, correct, total, band: responseBand(correct, total) };
    })
    .filter((area) => area.total > 0);
  const takenSections = exam.sections.filter((section) =>
    completed.includes(section.id),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={mode === "practice" ? "結果 · Practice" : "結果"}
        title={exam.title}
        description={[
          passLine(summary.passes, exam.sections.length, practicePassTotal(exam)),
          mode === "practice" ? "This was a practice run with the clock paused and the recording replayable, so read the score as a guide." : "",
          signedIn ? "This paper is saved on your account." : "",
        ]
          .filter(Boolean)
          .join(" ")}
        actions={
          <>
            <Button type="button" onClick={onAgain}>
              Sit again
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/mock">All mocks</Link>
            </Button>
          </>
        }
      />

      <Card className="gap-0 py-0">
        <CardContent className="flex flex-wrap items-baseline justify-between gap-3 p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">
            {summary.total != null ? "Estimated total" : "Sections scored"}
          </p>
          {summary.total != null ? (
            <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
              {formatPoints(summary.total)}
              <span className="text-xl text-muted-foreground">
                /{paperPoints(exam.sections.length)}
              </span>
            </p>
          ) : (
            <p className="font-jp text-lg font-semibold">
              {taken.map((section) => section.title).join("、") || "No section"}
            </p>
          )}
        </CardContent>
      </Card>

      <ResultsActions
        exam={exam}
        answers={answers}
        completed={completed}
        signedIn={signedIn}
        score={
          summary.total != null && summary.passes != null
            ? {
                total: summary.total,
                max: paperPoints(exam.sections.length),
                passes: summary.passes,
                sections: summary.sections.map((section) => ({
                  id: section.id,
                  points: section.points ?? 0,
                })),
              }
            : null
        }
      />

      <div
        className={
          exam.sections.length > 2
            ? "grid gap-4 sm:grid-cols-3"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        {summary.sections.map((score) => (
          <SectionScoreCard
            key={score.id}
            score={score}
            rows={mondaiScores.filter((row) => row.sectionId === score.id)}
          />
        ))}
      </div>

      {areas.length > 0 && (
        <section className="space-y-3">
          <SectionHeading
            title="Response bands"
            meta="A ≥ 67% · B 34–66% · C < 34%"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map((area) => (
              <div
                key={area.title}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <p className="font-jp text-sm">{area.title}</p>
                <p className="font-mono text-lg font-semibold tabular-nums">
                  {area.band}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {area.correct}/{area.total}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {mondaiScores.length > 0 && (
        <section className="space-y-3">
          <SectionHeading title="By 問題" />
          <MondaiTable rows={mondaiScores} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {exam.sections.some((section) => section.id === "language-reading")
              ? exam.level === "N1"
                ? "Each clock is 60. 言語知識（文字・語彙・文法）・読解 splits that 60 across 文字・語彙, 文法 and 読解, then across each 問題. 聴解 is its own 60. The real N1 report scores 言語知識, 読解 and 聴解 separately, out of 180, and a pass is 100 with 19 in each. Letters are the report’s bands: A is 67% or more, B is 34–66%, C is under 34%."
                : "Each clock is 60. 言語知識・読解 splits that 60 across 文字・語彙, 文法 and 読解, then across each 問題. 聴解 is its own 60. The real N2 report scores 言語知識, 読解 and 聴解 separately, out of 180, and a pass is 90 with 19 in each. Letters are the report’s bands: A is 67% or more, B is 34–66%, C is under 34%."
              : "Each paper is 60. 文字・語彙 is one part, so its five 問題 split that 60. 文法・読解 has two parts, so grammar and reading are 30 each, then each 問題 splits that 30, then the items split the 問題. The real report groups vocabulary with grammar instead, and shifts the number for item difficulty, which is not published. Vocabulary and grammar letters are the report’s bands: A is 67% or more, B is 34–66%, C is under 34%."}
          </p>
        </section>
      )}

      {takenSections.length > 0 && (
        <section className="space-y-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Hide the paper" : "Review the paper"}
          </Button>
          {open && (
            <div className="space-y-12">
              {takenSections.map((section) =>
                section.parts.map((part) =>
                  part.mondai.map((mondai) => (
                    <MondaiSheet
                      key={`${section.id}-${part.id}-${mondai.number}`}
                      examId={exam.id}
                      mondai={mondai}
                      partId={part.id}
                      sectionId={section.id}
                      answers={answers}
                      reveal
                      onChoose={() => undefined}
                    />
                  )),
                ),
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
