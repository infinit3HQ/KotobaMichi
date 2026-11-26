"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import {
  type MockExam,
  type MockSection,
  answerKey,
  clearAttempt,
  loadAttempt,
  saveAttempt,
} from "@/lib/mock-exam";
import { fetchMockExamState, finishMockAttempt, saveMockAttempt } from "@/lib/mock-attempts";
import {
  AT_MENU,
  canOpenSection,
  completeSection,
  completedFromSave,
  isSittingComplete,
} from "@/lib/mock-sitting";
import { MockExamBrief, MockSectionMenu } from "@/components/organisms/mock-exam-menu";
import { ListeningTrack } from "@/components/organisms/mock/listening-track";
import { PausedPanel } from "@/components/organisms/mock/paused-panel";
import { MockResults } from "@/components/organisms/mock/mock-results";
import { MondaiNav, type MondaiNavItem } from "@/components/organisms/mock/mondai-nav";
import { MondaiSheet } from "@/components/organisms/mock/mondai-sheet";
import { SessionTopBar } from "@/components/organisms/mock/session-top-bar";
import {
  canPause,
  DEFAULT_MODE,
  modeFromSave,
  remainingMs,
  resumeClock,
  type MockMode,
} from "@/lib/mock-clock";
import { useAuthStore } from "@/stores/auth";
import { track } from "@/lib/analytics/posthog";
type Phase = "brief" | "menu" | "running" | "done";

/**
 * A restored practice section comes back paused, so time spent away from the
 * page is not charged to it. Strict sections never pause.
 */
function restoredPause(mode: MockMode, saved: number | null | undefined) {
  if (!canPause(mode)) return null;
  return saved ?? Date.now();
}

function mondaiOf(section: MockSection) {
  return section.parts.flatMap((part) =>
    part.mondai.map((mondai) => ({ partId: part.id, partTitle: part.title, mondai }))
  );
}

export function MockExamSession({ exam }: { exam: MockExam }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [focus, setFocus] = useState(true);
  const [sectionIndex, setSectionIndex] = useState(AT_MENU);
  const [completed, setCompleted] = useState<string[]>([]);
  const [mondaiIndex, setMondaiIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [mode, setMode] = useState<MockMode>(DEFAULT_MODE);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
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
  const snapshot = useRef({ phase, sectionIndex, startedAt, answers, completed, mode, pausedAt });
  snapshot.current = { phase, sectionIndex, startedAt, answers, completed, mode, pausedAt };

  useEffect(() => {
    const saved = loadAttempt(exam.id);
    if (saved) {
      const done = completedFromSave(exam, saved);
      const savedMode = modeFromSave(saved.mode);
      setMode(savedMode);
      setAnswers(saved.answers);
      setCompleted(done);
      if (saved.finished) {
        setPhase("done");
        setFocus(false);
      } else if (canOpenSection(exam, done, saved.sectionIndex)) {
        setSectionIndex(saved.sectionIndex);
        setStartedAt(saved.sectionStartedAt);
        setPausedAt(restoredPause(savedMode, saved.pausedAt));
        setPhase("running");
      } else {
        setSectionIndex(AT_MENU);
        setPhase("menu");
      }
    }
    setReady(true);
  }, [exam]);

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
          const done = completedFromSave(exam, remote.current);
          const remoteMode = modeFromSave(remote.current.mode);
          setMode(remoteMode);
          setAnswers(remote.current.answers ?? {});
          setCompleted(done);
          if (canOpenSection(exam, done, remote.current.sectionIndex)) {
            setSectionIndex(remote.current.sectionIndex);
            setStartedAt(remote.current.sectionStartedAt);
            setPausedAt(restoredPause(remoteMode, remote.current.pausedAt));
            setPhase("running");
            setFocus(true);
          } else {
            setSectionIndex(AT_MENU);
            setPhase("menu");
          }
          return;
        }
        if (local.phase === "brief") return;
        const payload = {
          sectionIndex: local.sectionIndex,
          sectionStartedAt: local.startedAt || Date.now(),
          answers: local.answers,
          completedSections: local.completed,
          mode: local.mode,
          pausedAt: local.pausedAt,
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
  }, [ready, authChecked, user, exam]);

  useEffect(() => {
    if (!accountSynced || !user || phase === "brief") return;
    const payload = {
      sectionIndex,
      sectionStartedAt: startedAt || Date.now(),
      answers,
      completedSections: completed,
      mode,
      pausedAt,
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
  }, [accountSynced, user, phase, sectionIndex, startedAt, answers, completed, mode, pausedAt, exam.id]);

  useEffect(() => {
    if (phase !== "running" || pausedAt != null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [phase, pausedAt]);

  useEffect(() => {
    if (!ready || phase === "brief") return;
    saveAttempt(exam.id, {
      sectionIndex,
      sectionStartedAt: startedAt,
      answers,
      completedSections: completed,
      finished: phase === "done",
      mode,
      pausedAt,
    });
  }, [ready, phase, sectionIndex, startedAt, answers, completed, mode, pausedAt, exam.id]);

  // Practice pauses itself when the page is hidden or closed. The save is written here
  // directly because a state update would not render before the page goes away.
  useEffect(() => {
    if (phase !== "running" || !canPause(mode)) return;
    const pauseNow = () => {
      const local = snapshot.current;
      if (local.pausedAt != null) return;
      const stamp = Date.now();
      saveAttempt(exam.id, {
        sectionIndex: local.sectionIndex,
        sectionStartedAt: local.startedAt,
        answers: local.answers,
        completedSections: local.completed,
        finished: false,
        mode: local.mode,
        pausedAt: stamp,
      });
      setPausedAt(stamp);
      setNow(stamp);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pauseNow();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pauseNow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pauseNow);
    };
  }, [phase, mode, exam.id]);

  useEffect(() => {
    if (phase !== "running") return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [phase]);

  const section = phase === "running" ? exam.sections[sectionIndex] : undefined;
  const sheets = useMemo(() => (section ? mondaiOf(section) : []), [section]);
  const current = sheets[mondaiIndex];
  const paused = pausedAt != null;
  const remaining = section ? remainingMs(section.minutes, { startedAt, pausedAt }, now) : 0;

  const pause = () => {
    if (!canPause(mode) || paused) return;
    const stamp = Date.now();
    setPausedAt(stamp);
    setNow(stamp);
  };

  const resume = () => {
    const stamp = Date.now();
    const next = resumeClock({ startedAt, pausedAt }, stamp);
    setStartedAt(next.startedAt);
    setPausedAt(next.pausedAt);
    setNow(stamp);
  };

  const finishSection = useCallback(() => {
    if (locked.current || !section) return;
    locked.current = true;
    setConfirmEnd(false);
    const done = completeSection(exam, completed, section.id);
    const answered = Object.keys(answers).length;
    track("mock_section_finished", { ...mockProps(exam, mode), section: section.id, answered });
    if (isSittingComplete(exam, done)) {
      track("mock_exam_completed", { ...mockProps(exam, mode), answered, signed_in: Boolean(user) });
    }
    setCompleted(done);
    setSectionIndex(AT_MENU);
    setMondaiIndex(0);
    setPausedAt(null);
    setFocus(false);
    setPhase(isSittingComplete(exam, done) ? "done" : "menu");
  }, [exam, completed, section, answers, mode, user]);

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

  const openSection = (index: number) => {
    if (!canOpenSection(exam, completed, index)) return;
    track("mock_section_opened", { ...mockProps(exam, mode), section: exam.sections[index]?.id ?? String(index) });
    const stamp = Date.now();
    setSectionIndex(index);
    setMondaiIndex(0);
    setStartedAt(stamp);
    setPausedAt(null);
    setNow(stamp);
    setPhase("running");
    setFocus(true);
    setAudioFailed(false);
    locked.current = false;
  };

  const begin = (index: number) => {
    if (!exam.sections[index]) return;
    track("mock_exam_started", { ...mockProps(exam, mode), section: exam.sections[index].id });
    const stamp = Date.now();
    clearAttempt(exam.id);
    finishedSent.current = false;
    setAnswers({});
    setCompleted([]);
    setSectionIndex(index);
    setMondaiIndex(0);
    setStartedAt(stamp);
    setPausedAt(null);
    setNow(stamp);
    setPhase("running");
    setFocus(true);
    setAudioFailed(false);
    locked.current = false;
  };

  const endSitting = () => {
    setSectionIndex(AT_MENU);
    setFocus(false);
    setPhase("done");
  };

  const choose = (partId: string, mondai: number, item: number, option: number) => {
    if (phase !== "running" || !section || paused) return;
    setAnswers((prev) => ({
      ...prev,
      [answerKey(section.id, partId, mondai, item)]: option,
    }));
  };


  if (!ready) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="space-y-2 border-b border-border pb-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {exam.sections.map((item) => (
            <Skeleton key={item.id} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "brief") {
    return (
      <MockExamBrief
        exam={exam}
        signedIn={Boolean(user)}
        mode={mode}
        onModeChange={setMode}
        onBegin={begin}
      />
    );
  }

  if (phase === "menu") {
    return <MockSectionMenu exam={exam} completed={completed} onOpen={openSection} onEnd={endSitting} />;
  }

  if (phase === "done") {
    return (
      <MockResults
        exam={exam}
        answers={answers}
        completed={completed}
        signedIn={Boolean(user)}
        mode={mode}
        onAgain={() => {
          clearAttempt(exam.id);
          finishedSent.current = false;
          setPhase("brief");
          setAnswers({});
          setCompleted([]);
        }}
      />
    );
  }

  if (!section) return null;

  const answeredIn = (sheet: (typeof sheets)[number]) =>
    sheet.mondai.items.filter(
      (item) => answers[answerKey(section.id, sheet.partId, sheet.mondai.number, item.number)] != null
    ).length;
  const navItems: MondaiNavItem[] = sheets.map((sheet) => ({
    key: `${sheet.partId}-${sheet.mondai.number}`,
    number: sheet.mondai.number,
    answered: answeredIn(sheet),
    total: sheet.mondai.items.length,
  }));
  const answeredHere = current ? answeredIn(current) : 0;
  const answeredSection = navItems.reduce((sum, item) => sum + item.answered, 0);
  const itemsSection = navItems.reduce((sum, item) => sum + item.total, 0);

  const shell = (
    <div className="flex min-h-0 flex-1 flex-col">
      <SessionTopBar
        sectionTitle={section.title}
        sectionNumber={sectionIndex + 1}
        sectionCount={exam.sections.length}
        mondaiNumber={current ? current.mondai.number : null}
        remaining={remaining}
        mode={mode}
        paused={paused}
        onPause={pause}
        onResume={resume}
        answered={answeredSection}
        totalItems={itemsSection}
        focus={focus}
        confirmEnd={confirmEnd}
        pinned={!focus}
        onToggleFocus={() => setFocus((value) => !value)}
        onAskFinish={() => setConfirmEnd((value) => !value)}
        onCancelFinish={() => setConfirmEnd(false)}
        onConfirmFinish={finishSection}
      />

      <div className="flex min-h-0 flex-1">
        <MondaiNav items={navItems} current={mondaiIndex} onSelect={setMondaiIndex} layout="side" />

        <div className={focus ? "min-w-0 flex-1 overflow-y-auto" : "min-w-0 flex-1"}>
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
            <MondaiNav items={navItems} current={mondaiIndex} onSelect={setMondaiIndex} layout="row" />

            {section.id === "listening" && (
              <ListeningTrack
                examId={exam.id}
                mode={mode}
                paused={paused}
                onFailed={() => setAudioFailed(true)}
              />
            )}

            {paused ? (
              <PausedPanel remaining={remaining} onResume={resume} />
            ) : current && (
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

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={mondaiIndex === 0}
                onClick={() => setMondaiIndex((index) => Math.max(0, index - 1))}
              >
                <ChevronLeft />
                Previous
              </Button>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {answeredHere}/{current?.mondai.items.length ?? 0}
              </p>
              {mondaiIndex < sheets.length - 1 ? (
                <Button type="button" variant="outline" onClick={() => setMondaiIndex((index) => index + 1)}>
                  Next
                  <ChevronRight />
                </Button>
              ) : (
                <Button type="button" onClick={() => setConfirmEnd(true)}>
                  Finish section
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (focus) {
    return <div className="fixed inset-0 z-[70] flex flex-col bg-background">{shell}</div>;
  }

  return <div className="flex min-h-[70dvh] flex-col sm:rounded-xl sm:border sm:border-border sm:bg-card">{shell}</div>;
}

function mockProps(exam: { id: string; level: string }, mode: string) {
  return { exam_id: exam.id, level: exam.level, mode };
}
