"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese } from "@/lib/audio";
import { PageHeader, SectionHeading } from "@/components/molecules/page-header";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { useLocale } from "@/components/organisms/locale-provider";
import { LearningPath } from "@/components/organisms/learning-path";
import { ActiveDrill } from "@/components/organisms/practice/active-drill";
import { DrillPicker } from "@/components/organisms/practice/drill-picker";
import {
  PRACTICE_LEVELS,
  isPracticeLevel,
  isPracticeMode,
  type PracticeMode,
} from "@/components/organisms/practice/drills";
import { NORMAL_RATE, SLOW_RATE, VoiceControls } from "@/components/organisms/practice/voice-controls";

const PHONE_QUERY = "(max-width: 639px)";

export default function PracticeDojoPage() {
  const { t } = useLocale();
  const [mode, setMode] = useState<PracticeMode>("sprint");
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>("N5");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(NORMAL_RATE);
  const drillRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level");
    const nextMode = params.get("mode");
    if (isPracticeLevel(level)) setSelectedLevel(level);
    if (isPracticeMode(nextMode)) setMode(nextMode);
  }, []);

  /** On phones the drill sits below the fold, so bring it into view after a pick. */
  const revealDrill = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia(PHONE_QUERY).matches) return;
    window.requestAnimationFrame(() => {
      drillRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selectDrill = (next: PracticeMode) => {
    setMode(next);
    revealDrill();
  };

  const selectLevel = (level: JLPTLevel) => {
    setSelectedLevel(level);
    setSelectedTopic("All");
  };

  const toggleSpeed = () => {
    const nextRate = speechRate === NORMAL_RATE ? SLOW_RATE : NORMAL_RATE;
    setSpeechRate(nextRate);
    if (soundEnabled) speakJapanese("こんにちは", { rate: nextRate });
  };

  const levelOptions = PRACTICE_LEVELS.map((level) => ({ value: level, label: level }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="道場"
        title={t.practice.title}
        description={t.practice.subtitle}
        actions={
          <VoiceControls
            speechRate={speechRate}
            soundEnabled={soundEnabled}
            onToggleSpeed={toggleSpeed}
            onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
          />
        }
      />

      <LearningPath
        onContinue={(level, nextMode) => {
          selectLevel(level);
          if (isPracticeMode(nextMode)) setMode(nextMode);
          revealDrill();
        }}
      />

      <section className="space-y-3" aria-labelledby="level-heading">
        <SectionHeading title={<span id="level-heading">{t.practice.levelLabel}</span>} />
        <SegmentedControl
          value={selectedLevel}
          onValueChange={selectLevel}
          options={levelOptions}
          ariaLabel={t.practice.levelLabel}
          className="w-full sm:w-fit"
          fullWidth
        />
        <p className="text-sm text-muted-foreground">{t.practice.levels[selectedLevel]}</p>
      </section>

      <DrillPicker value={mode} onSelect={selectDrill} />

      <section ref={drillRef} className="scroll-mt-20 space-y-3" aria-labelledby="active-drill-heading">
        <SectionHeading
          title={<span id="active-drill-heading">{t.practice.drills[mode].title}</span>}
          meta={mode === "kana" ? undefined : selectedLevel}
        />
        <ActiveDrill
          mode={mode}
          level={selectedLevel}
          topic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          soundEnabled={soundEnabled}
          speechRate={speechRate}
        />
      </section>
    </div>
  );
}
