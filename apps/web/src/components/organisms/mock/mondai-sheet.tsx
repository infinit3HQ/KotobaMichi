"use client";

import { Button } from "@/components/atoms/button";
import { ExamText } from "@/components/atoms/exam-text";
import { type MockMondai, answerKey, examAsset } from "@/lib/mock-exam";
import { groupItemsByPassage } from "@/lib/mock-passages";
import { cn } from "@/lib/utils";

export type ChooseHandler = (partId: string, mondai: number, item: number, option: number) => void;

function passageText(text: string) {
  return text.replace(/(?:\n\d{1,2})+\s*$/g, "").trim();
}

/** Printed choices are absent for listening 問題3 and 問題5, and sit inside the picture for 問題4. */
function listeningChoiceCount(mondai: MockMondai) {
  const plain = mondai.instruction.replace(/<[^>]+>/g, "");
  const match = plain.match(/1\s*から\s*([1-4])/);
  if (match) return Number(match[1]);
  if (mondai.kind === "picture") return 3;
  return 4;
}

export function optionTone({ selected, correct, wrong }: { selected: boolean; correct: boolean; wrong: boolean }) {
  if (correct) return "border-chart-3/60 bg-chart-3/10 disabled:opacity-100 dark:border-chart-3/60 dark:bg-chart-3/10";
  if (wrong) return "border-destructive/50 bg-destructive/10 disabled:opacity-100 dark:border-destructive/50 dark:bg-destructive/10";
  if (selected) return "border-primary bg-primary/10 hover:bg-primary/15 disabled:opacity-100 dark:border-primary dark:bg-primary/15 dark:hover:bg-primary/20";
  return "disabled:opacity-70";
}

function QuestionBlock({
  examId,
  item,
  partId,
  sectionId,
  mondaiNumber,
  chosen,
  reveal,
  showSpoken,
  blankChoices,
  onChoose,
}: {
  examId: string;
  item: MockMondai["items"][number];
  partId: string;
  sectionId: string;
  mondaiNumber: number;
  chosen: number | undefined;
  reveal: boolean;
  showSpoken: boolean;
  blankChoices: number;
  onChoose: ChooseHandler;
}) {
  const choices =
    item.options.length > 0
      ? item.options
      : Array.from({ length: blankChoices }, (_, index) => ({ number: index + 1, text: "" }));
  const numbersOnly = item.options.length === 0;
  return (
    <li className="space-y-3">
      <p className="font-jp text-[15px] leading-9 break-words">
        <span className="mr-2 font-semibold">{item.number}.</span>
        <ExamText text={item.prompt} />
      </p>
      {sectionId === "listening" && showSpoken && item.spoken && (
        <p className="font-jp text-sm leading-8 text-muted-foreground">
          <ExamText text={item.spoken} />
        </p>
      )}
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={examAsset(examId, item.image) ?? ""}
          alt=""
          className="w-full max-w-md rounded-lg border border-border bg-white"
        />
      )}
      {choices.length > 0 && (
        <div className={numbersOnly ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
          {choices.map((option) => {
            const selected = chosen === option.number;
            const correct = reveal && option.number === item.answer;
            const wrong = reveal && selected && option.number !== item.answer;
            return (
              <Button
                key={option.number}
                type="button"
                variant="outline"
                disabled={reveal}
                aria-pressed={selected}
                onClick={() => onChoose(partId, mondaiNumber, item.number, option.number)}
                className={cn(
                  "font-jp h-auto min-h-9 py-2 font-normal leading-7",
                  numbersOnly ? "min-w-12 justify-center" : "w-full justify-start whitespace-normal text-left",
                  optionTone({ selected, correct, wrong })
                )}
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                  {option.number}
                </span>
                {option.text ? (
                  <span className="min-w-0 break-words">
                    <ExamText text={option.text} />
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** One 問題: its instruction, any passages or pictures, and the questions with their choices. */
export function MondaiSheet({
  examId,
  mondai,
  partId,
  sectionId,
  answers,
  reveal,
  showSpoken = true,
  onChoose,
}: {
  examId: string;
  mondai: MockMondai;
  partId: string;
  sectionId: string;
  answers: Record<string, number>;
  reveal: boolean;
  showSpoken?: boolean;
  onChoose: ChooseHandler;
}) {
  const { groups, rest } = groupItemsByPassage(mondai);
  const blankChoices = sectionId === "listening" ? listeningChoiceCount(mondai) : 0;
  const renderItem = (item: MockMondai["items"][number]) => (
    <QuestionBlock
      key={item.number}
      examId={examId}
      item={item}
      partId={partId}
      sectionId={sectionId}
      mondaiNumber={mondai.number}
      chosen={answers[answerKey(sectionId, partId, mondai.number, item.number)]}
      reveal={reveal}
      showSpoken={showSpoken}
      blankChoices={blankChoices}
      onChoose={onChoose}
    />
  );

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-jp text-lg font-semibold tracking-tight">問題{mondai.number}</h2>
        <p className="font-jp text-sm leading-8 text-muted-foreground">
          <ExamText text={mondai.instruction} />
        </p>
      </header>

      {mondai.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={examAsset(examId, mondai.image) ?? ""}
          alt=""
          className="w-full rounded-lg border border-border bg-white"
        />
      )}

      {groups.map(({ passage, items, index }) => {
        const body = passage.text ? passageText(passage.text) : "";
        return (
          <section key={`${passage.label ?? "p"}-${index}`} className="space-y-4">
            {passage.lead && (
              <p className="font-jp text-sm leading-8 text-muted-foreground">
                <ExamText text={passage.lead} />
              </p>
            )}
            {passage.label && <p className="font-jp text-sm font-semibold">{passage.label}</p>}
            {passage.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={examAsset(examId, passage.image) ?? ""}
                alt=""
                className="w-full rounded-lg border border-border bg-white"
              />
            )}
            {!passage.image && body && (
              <div className="font-jp whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-4 text-[15px] leading-9">
                <ExamText text={body} />
              </div>
            )}
            {items.length > 0 && <ol className="space-y-8">{items.map(renderItem)}</ol>}
          </section>
        );
      })}
      {rest.length > 0 && <ol className="space-y-8">{rest.map(renderItem)}</ol>}
    </article>
  );
}
