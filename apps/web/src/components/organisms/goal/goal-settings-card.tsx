"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import type { JLPTLevel } from "@/data/grammar";
import { useSaveGoal } from "@/hooks/use-goal";
import { useLearning } from "@/hooks/use-learning";
import { useLoopText } from "@/hooks/use-loop-text";
import { formatSitting, toDay, upcomingSittings } from "@/lib/exam-plan";
import { DEFAULT_GOAL, JLPT_LEVELS, type LearningGoal } from "@/lib/learning";

const DAILY_GOALS = ["10", "20", "30", "50"] as const;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const NO_LEVEL = "none";

type DateChoice = "none" | "other" | string;

function dateChoice(examDate: string | null, sittings: readonly string[]): DateChoice {
  if (!examDate) return "none";
  return sittings.includes(examDate) ? examDate : "other";
}

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** Exam level and date, daily card goal and email nudges. Lives on the profile at #goal. */
export function GoalSettingsCard() {
  const text = useLoopText();
  const { summary } = useLearning();
  const save = useSaveGoal();
  const sittings = upcomingSittings(toDay(new Date()));
  const [draft, setDraft] = useState<LearningGoal>(DEFAULT_GOAL);
  const [choice, setChoice] = useState<DateChoice>("none");

  const saved = summary?.goal;
  useEffect(() => {
    if (!saved) return;
    setDraft(saved);
    setChoice(dateChoice(saved.examDate, upcomingSittings(toDay(new Date()))));
  }, [saved]);

  const update = (patch: Partial<LearningGoal>) => setDraft((current) => ({ ...current, ...patch }));

  const pickDate = (value: DateChoice) => {
    setChoice(value);
    if (value === "none") update({ examDate: null });
    else if (value !== "other") update({ examDate: value });
  };

  const submit = () => {
    save.mutate(draft, {
      onSuccess: () => toast.success(text.goal.saved),
      onError: () => toast.error(text.goal.error),
    });
  };

  const dateOptions = [
    { value: "none", label: text.goal.noDate },
    ...sittings.map((day) => ({ value: day, label: formatSitting(day) })),
    { value: "other", label: text.goal.otherDate },
  ];

  return (
    <Card id="goal" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{text.goal.title}</CardTitle>
        <CardDescription>{text.goal.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[10rem_auto] sm:justify-start">
          <div className="space-y-2">
            <Label htmlFor="goal-level">{text.goal.level}</Label>
            <Select
              value={draft.targetLevel ?? NO_LEVEL}
              onValueChange={(value) => update({ targetLevel: value === NO_LEVEL ? null : (value as JLPTLevel) })}
            >
              <SelectTrigger id="goal-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LEVEL}>{text.goal.noLevel}</SelectItem>
                {JLPT_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="goal-date">{text.goal.examDate}</Label>
            <Select value={choice} onValueChange={pickDate}>
              <SelectTrigger id="goal-date" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {choice === "other" ? (
              <Input
                type="date"
                aria-label={text.goal.otherDate}
                className="w-full sm:w-48"
                min={toDay(new Date())}
                value={draft.examDate ?? ""}
                onChange={(event) => update({ examDate: event.target.value || null })}
              />
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{text.goal.dailyGoal}</Label>
          <SegmentedControl
            value={String(draft.dailyGoal) as (typeof DAILY_GOALS)[number]}
            onValueChange={(value) => update({ dailyGoal: Number(value) })}
            options={DAILY_GOALS.map((value) => ({ value, label: value }))}
            ariaLabel={text.goal.dailyGoal}
            size="sm"
          />
          <p className="text-xs text-muted-foreground">{text.goal.dailyGoalHint}</p>
        </div>

        <div className="space-y-4 border-t border-border pt-5">
          <ToggleRow
            id="goal-reminders"
            label={text.goal.reminders}
            hint={text.goal.remindersHint}
            checked={draft.remindersEnabled}
            onChange={(remindersEnabled) => update({ remindersEnabled })}
          />
          {draft.remindersEnabled ? (
            <div className="flex items-center gap-3 pl-0 sm:pl-1">
              <Label htmlFor="goal-hour" className="text-sm font-normal text-muted-foreground">
                {text.goal.reminderHour}
              </Label>
              <Select value={String(draft.reminderHour)} onValueChange={(value) => update({ reminderHour: Number(value) })}>
                <SelectTrigger id="goal-hour" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {hourLabel(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <ToggleRow
            id="goal-recap"
            label={text.goal.recap}
            hint={text.goal.recapHint}
            checked={draft.weeklyRecap}
            onChange={(weeklyRecap) => update({ weeklyRecap })}
          />
        </div>

        <Button type="button" onClick={submit} disabled={save.isPending || !summary}>
          {text.goal.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
