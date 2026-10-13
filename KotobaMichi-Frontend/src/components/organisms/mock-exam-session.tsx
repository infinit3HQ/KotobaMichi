"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  type MockExam,
  type MockMondai,
  type MockSection,
  answerKey,
  clearAttempt,
  examAsset,
  formatClock,
  listeningAudioUrl,
  formatPoints,
  loadAttempt,
  PASS_SECTION,
  PASS_TOTAL,
  responseBand,
  saveAttempt,
  scoreByMondai,
  scoreExam,
  SECTION_POINTS,
  sectionPoints,
} from "@/lib/mock-exam";
import { fetchMockExamState, finishMockAttempt, saveMockAttempt } from "@/lib/mock-attempts";
import { useAuthStore } from "@/stores/auth";

type Phase = "brief" | "running" | "done";

function mondaiOf(section: MockSection) {
  return section.parts.flatMap((part) =>
    part.mondai.map((mondai) => ({ partId: part.id, partTitle: part.title, mondai }))
  );
}

export function MockExamSession({ exam }: { exam: MockExam }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [focus, setFocus] = useState(true);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [mondaiIndex, setMondaiIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ready, setReady] = useState(false);
  const [accountSynced, setAccountSynced] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const locked = useRef(false);
  const finishedSent = useRef(false);
  const user = useAuthStore((state) => state.user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const snapshot = useRef({ phase, sectionIndex, startedAt, answers });
  snapshot.current = { phase, sectionIndex, startedAt, answers };

  useEffect(() => {
    const saved = loadAttempt(exam.id);
    if (saved?.finished) {
      setAnswers(saved.answers);
      setPhase("done");
      setFocus(false);
    } else if (saved) {
      setAnswers(saved.answers);
      setSectionIndex(saved.sectionIndex);
      setStartedAt(saved.sectionStartedAt);
      setPhase("running");
    }
    setReady(true);
  }, [exam.id]);

  useEffect(() => {
    if (!ready || !authChecked) return;
    if (!user) {
      setAccountSynced(true);
      return;
    }
    let cancel = false;
    const local = snapshot.current;
    fetchMockExamState(exam.id)
      .then(async (remote) => {
        if (cancel) return;
        if (remote.current) {
          setAnswers(remote.current.answers ?? {});
          setSectionIndex(remote.current.sectionIndex);
          setStartedAt(remote.current.sectionStartedAt);
          setPhase("running");
          setFocus(true);
          return;
        }
        if (local.phase === "brief") return;
        const payload = {
          sectionIndex: local.sectionIndex,
          sectionStartedAt: local.startedAt || Date.now(),
          answers: local.answers,
        };
        if (local.phase === "done") {
          finishedSent.current = true;
          await finishMockAttempt(exam.id, payload);
        } else {
          await saveMockAttempt(exam.id, payload);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancel) setAccountSynced(true);
      });
    return () => {
      cancel = true;
    };
  }, [ready, authChecked, user, exam.id]);

  useEffect(() => {
    if (!accountSynced || !user || phase === "brief") return;
    const payload = {
      sectionIndex,
      sectionStartedAt: startedAt || Date.now(),
      answers,
    };
    const handle = window.setTimeout(() => {
      if (phase === "done") {
        if (finishedSent.current) return;
        finishedSent.current = true;
        void finishMockAttempt(exam.id, payload).catch(() => {
          finishedSent.current = false;
        });
        return;
      }
      void saveMockAttempt(exam.id, payload).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(handle);
  }, [accountSynced, user, phase, sectionIndex, startedAt, answers, exam.id]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!ready || phase === "brief") return;
    saveAttempt(exam.id, {
      sectionIndex,
      sectionStartedAt: startedAt,
      answers,
      finished: phase === "done",
    });
  }, [ready, phase, sectionIndex, startedAt, answers, exam.id]);

  useEffect(() => {
    if (phase !== "running") return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [phase]);

  const section = exam.sections[sectionIndex];
  const sheets = useMemo(() => (section ? mondaiOf(section) : []), [section]);
  const current = sheets[mondaiIndex];
  const remaining = section ? section.minutes * 60_000 - (now - startedAt) : 0;

  const finishSection = useCallback(() => {
    if (locked.current) return;
    locked.current = true;
    setConfirmEnd(false);
    if (sectionIndex >= exam.sections.length - 1) {
      setPhase("done");
      setFocus(false);
      return;
    }
    setSectionIndex((index) => index + 1);
    setMondaiIndex(0);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, [exam.sections.length, sectionIndex]);

  useEffect(() => {
    locked.current = false;
  }, [sectionIndex, phase]);

  useEffect(() => {
    if (phase !== "running" || !section) return;
    if (remaining > 0) return;
    finishSection();
  }, [phase, remaining, section, finishSection]);

  useEffect(() => {
    if (!focus || phase !== "running") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [focus, phase]);

  const begin = () => {
    const stamp = Date.now();
    setAnswers({});
    setSectionIndex(0);
    setMondaiIndex(0);
    setStartedAt(stamp);
    setNow(stamp);
    setPhase("running");
    setFocus(true);
    setAudioFailed(false);
    finishedSent.current = false;
    locked.current = false;
    clearAttempt(exam.id);
  };

  const choose = (partId: string, mondai: number, item: number, option: number) => {
    if (phase !== "running") return;
    setAnswers((prev) => ({
      ...prev,
      [answerKey(section.id, partId, mondai, item)]: option,
    }));
  };

  if (!ready) {
    return <div className="mx-auto h-40 max-w-3xl animate-pulse rounded-2xl bg-muted/60" />;
  }

  if (phase === "brief") {
    return <Brief exam={exam} signedIn={Boolean(user)} onBegin={begin} />;
  }

  if (phase === "done") {
    return (
      <Results
        exam={exam}
        answers={answers}
        signedIn={Boolean(user)}
        onAgain={() => {
          clearAttempt(exam.id);
          finishedSent.current = false;
          setPhase("brief");
          setAnswers({});
        }}
      />
    );
  }

  const low = remaining < 5 * 60_000;
  const urgent = remaining < 60_000;
  const answeredHere = current
    ? current.mondai.items.filter(
        (item) => answers[answerKey(section.id, current.partId, current.mondai.number, item.number)] != null
      ).length
    : 0;

  const shell = (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border/80 bg-background/95 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <div className="min-w-0">
          <p className="truncate font-jp text-sm font-semibold">{section.title}</p>
          <p className="text-[11px] text-muted-foreground">
            Block {sectionIndex + 1} of {exam.sections.length}
            {current ? ` · 問題${current.mondai.number}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`rounded-full px-3 py-1 font-mono text-lg font-semibold tabular-nums tracking-tight ${
              urgent
                ? "bg-primary text-primary-foreground"
                : low
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-foreground"
            }`}
            aria-live="polite"
          >
            {formatClock(remaining)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={focus ? "Leave focus mode" : "Enter focus mode"}
            onClick={() => setFocus((value) => !value)}
          >
            {focus ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-44 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border/70 p-3 md:flex">
          {sheets.map((sheet, index) => {
            const done = sheet.mondai.items.filter(
              (item) => answers[answerKey(section.id, sheet.partId, sheet.mondai.number, item.number)] != null
            ).length;
            return (
              <button
                key={`${sheet.partId}-${sheet.mondai.number}`}
                type="button"
                onClick={() => setMondaiIndex(index)}
                className={`rounded-xl px-3 py-2 text-left text-sm ${
                  index === mondaiIndex ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                }`}
              >
                <span className="font-jp font-semibold">問題{sheet.mondai.number}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {done}/{sheet.mondai.items.length}
                </span>
              </button>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-8">
            <div className="flex gap-2 overflow-x-auto md:hidden">
              {sheets.map((sheet, index) => (
                <button
                  key={`${sheet.partId}-${sheet.mondai.number}`}
                  type="button"
                  onClick={() => setMondaiIndex(index)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    index === mondaiIndex ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  問題{sheet.mondai.number}
                </button>
              ))}
            </div>

            {section.id === "listening" && (
              <ListeningTrack examId={exam.id} onFailed={() => setAudioFailed(true)} />
            )}

            {current && (
              <MondaiSheet
                examId={exam.id}
                mondai={current.mondai}
                partId={current.partId}
                sectionId={section.id}
                answers={answers}
                reveal={false}
                showSpoken={audioFailed}
                onChoose={choose}
              />
            )}

            <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={mondaiIndex === 0}
                onClick={() => setMondaiIndex((index) => Math.max(0, index - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <p className="text-xs text-muted-foreground">
                {answeredHere}/{current?.mondai.items.length ?? 0} marked
              </p>
              {mondaiIndex < sheets.length - 1 ? (
                <Button type="button" variant="outline" onClick={() => setMondaiIndex((index) => index + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={() => setConfirmEnd(true)}>
                  Finish block
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmEnd && (
        <div className="border-t border-border bg-card px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Close {section.title}? {formatClock(remaining)} will not carry over.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setConfirmEnd(false)}>
                Keep working
              </Button>
              <Button type="button" onClick={finishSection}>
                Close block
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (focus) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-background">
        {shell}
      </div>
    );
  }

  return <div className="flex min-h-[70dvh] flex-col">{shell}</div>;
}

function ListeningTrack({ examId, onFailed }: { examId: string; onFailed: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const fail = () => {
    setFailed(true);
    onFailed();
  };

  const start = () => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(fail);
  };

  if (failed) {
    return (
      <p className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
        The recording did not load, so the question text from the script is on the page. 問題3 and 問題5
        speak their choices.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm">
      <audio
        ref={audioRef}
        src={listeningAudioUrl(examId)}
        preload="auto"
        onError={fail}
      />
      {playing ? (
        <p>The recording is playing once, straight through.</p>
      ) : (
        <Button type="button" onClick={start}>
          Play the recording
        </Button>
      )}
    </div>
  );
}

function Brief({ exam, signedIn, onBegin }: { exam: MockExam; signedIn: boolean; onBegin: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <p className="font-jp text-sm text-primary">模擬試験</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{exam.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{exam.note}</p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {exam.sections.map((section, index) => (
          <li key={section.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Block {index + 1}
            </p>
            <p className="mt-1 font-jp text-lg font-semibold">{section.title}</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{section.minutes}:00</p>
          </li>
        ))}
      </ol>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>Each block locks when its clock ends. Leftover time does not move forward.</li>
        <li>Answers stay hidden until the sitting is over.</li>
        <li>Focus mode hides the rest of the site. You can leave it without stopping the clock.</li>
        <li>
          {signedIn
            ? "This sitting, including every answer, is saved on your account."
            : "Sign in before you start if you want the score and the paper kept."}
        </li>
      </ul>
      <Button type="button" size="lg" className="rounded-full px-6" onClick={onBegin}>
        Start vocabulary · 30:00
      </Button>
    </div>
  );
}

function MondaiSheet({
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
  onChoose: (partId: string, mondai: number, item: number, option: number) => void;
}) {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-jp text-xl font-semibold">問題{mondai.number}</h2>
        <p className="font-jp text-sm leading-relaxed text-muted-foreground">{mondai.instruction}</p>
      </header>

      {mondai.image && (
        <img
          src={examAsset(examId, mondai.image) ?? ""}
          alt=""
          className="w-full rounded-xl border border-border bg-white"
        />
      )}

      {mondai.passages?.map((passage, index) => (
        <div key={`${passage.label ?? "p"}-${index}`} className="space-y-3">
          {passage.lead && (
            <p className="font-jp text-sm leading-relaxed text-muted-foreground">{passage.lead}</p>
          )}
          {passage.label && <p className="font-jp text-sm font-semibold">{passage.label}</p>}
          {passage.image && (
            <img
              src={examAsset(examId, passage.image) ?? ""}
              alt=""
              className="w-full rounded-xl border border-border bg-white"
            />
          )}
          {passage.text && (
            <div className="font-jp whitespace-pre-wrap text-[15px] leading-8">{passage.text}</div>
          )}
        </div>
      ))}

      <ol className="space-y-8">
        {mondai.items.map((item) => {
          const chosen = answers[answerKey(sectionId, partId, mondai.number, item.number)];
          return (
            <li key={item.number} className="space-y-3">
              <p className="font-jp text-[15px] leading-8">
                <span className="mr-2 font-semibold">{item.number}.</span>
                {item.prompt}
              </p>
              {sectionId === "listening" && showSpoken && item.spoken && (
                <p className="font-jp text-sm leading-7 text-muted-foreground">{item.spoken}</p>
              )}
              {item.image && (
                <img
                  src={examAsset(examId, item.image) ?? ""}
                  alt=""
                  className="max-w-md rounded-xl border border-border bg-white"
                />
              )}
              {item.options.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.options.map((option) => {
                    const selected = chosen === option.number;
                    const correct = reveal && option.number === item.answer;
                    const wrong = reveal && selected && option.number !== item.answer;
                    return (
                      <button
                        key={option.number}
                        type="button"
                        disabled={reveal}
                        onClick={() => onChoose(partId, mondai.number, item.number, option.number)}
                        className={`font-jp rounded-xl border px-3 py-2.5 text-left text-sm leading-6 transition-colors ${
                          correct
                            ? "border-emerald-600/40 bg-emerald-500/10"
                            : wrong
                              ? "border-primary/40 bg-primary/10"
                              : selected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-secondary"
                        }`}
                      >
                        <span className="mr-2 font-semibold">{option.number}</span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function Results({
  exam,
  answers,
  signedIn,
  onAgain,
}: {
  exam: MockExam;
  answers: Record<string, number>;
  signedIn: boolean;
  onAgain: () => void;
}) {
  const scores = scoreExam(exam, answers);
  const mondaiScores = scoreByMondai(exam, answers);
  const sectionTotals = new Map(scores.map((score) => [score.id, score.total]));
  const estimated = scores.map((score) => sectionPoints(score.correct, score.total));
  const estimatedTotal = estimated.reduce((sum, value) => sum + value, 0);
  const clearsSections = estimated.every((value) => value >= PASS_SECTION);
  const clearsTotal = estimatedTotal >= PASS_TOTAL;
  const areas = ["文字・語彙", "文法"].map((title) => {
    const rows = mondaiScores.filter((row) => row.partTitle === title);
    const correct = rows.reduce((sum, row) => sum + row.correct, 0);
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    return { title, correct, total, band: responseBand(correct, total) };
  });
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <div>
        <p className="font-jp text-sm text-primary">結果</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{exam.title}</h1>
        <p className="mt-3 font-mono text-4xl font-semibold tabular-nums">
          {formatPoints(estimatedTotal)}
          <span className="text-xl text-muted-foreground">/180</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {clearsSections && clearsTotal
            ? `Above the practice line: ${PASS_TOTAL} overall and ${PASS_SECTION} in every group.`
            : `Under the practice line. A pass needs ${PASS_TOTAL} overall and ${PASS_SECTION} in every group.`}
          {signedIn ? " This paper is saved on your account." : ""}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {scores.map((score) => {
          const points = sectionPoints(score.correct, score.total);
          return (
            <div key={score.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-jp text-sm text-muted-foreground">{score.title}</p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
                {formatPoints(points)}
                <span className="text-base text-muted-foreground">/{SECTION_POINTS}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {score.correct}/{score.total} marked
                {points >= PASS_SECTION ? ` · at or above ${PASS_SECTION}` : ` · under ${PASS_SECTION}`}
              </p>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        The three groups are an equal third of the 180. Inside a group, every question takes the same slice of
        that 60, so a reading question is worth more of the total than a vocabulary question. The real report
        then shifts the number for how hard each item was. That shift is not published, so this is the
        equal-share estimate, not an official scaled score. Vocabulary and grammar share one 60. Their letters
        are the report’s correct-answer bands: A is 67% or more, B is 34–66%, C is under 34%.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((area) => (
          <div key={area.title} className="rounded-2xl border border-border px-4 py-3">
            <p className="font-jp text-sm">{area.title}</p>
            <p className="mt-1 font-mono text-lg tabular-nums">
              {area.band}
              <span className="ml-2 text-sm text-muted-foreground">
                {area.correct}/{area.total}
              </span>
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">問題</th>
              <th className="px-4 py-2 text-right font-medium">Marked</th>
              <th className="px-4 py-2 text-right font-medium">Share of 60</th>
            </tr>
          </thead>
          <tbody>
            {mondaiScores.map((row) => {
              const sectionTotal = sectionTotals.get(row.sectionId) ?? row.total;
              const slice = sectionTotal > 0 ? SECTION_POINTS / sectionTotal : 0;
              return (
                <tr key={`${row.sectionId}-${row.partTitle}-${row.mondai}`} className="border-t border-border/70">
                  <td className="px-4 py-2">
                    <span className="font-jp">{row.partTitle}</span>
                    <span className="text-muted-foreground"> 問題{row.mondai}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {row.correct}/{row.total}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {formatPoints(row.correct * slice)}/{formatPoints(row.total * slice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide the paper" : "Review the paper"}
        </Button>
        <Button type="button" onClick={onAgain}>
          Sit again
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/mock">All mocks</Link>
        </Button>
      </div>
      {open && (
        <div className="space-y-12">
          {exam.sections.map((section) =>
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
                  onChoose={() => {}}
                />
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
