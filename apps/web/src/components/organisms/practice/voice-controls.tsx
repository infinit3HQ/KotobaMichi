"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/organisms/locale-provider";

export const NORMAL_RATE = 0.92;
export const SLOW_RATE = 0.72;

/** Voice speed toggle and sound-effects mute, shown in the practice page header. */
export function VoiceControls({
  speechRate,
  soundEnabled,
  onToggleSpeed,
  onToggleSound,
}: {
  speechRate: number;
  soundEnabled: boolean;
  onToggleSpeed: () => void;
  onToggleSound: () => void;
}) {
  const { t } = useLocale();
  const soundLabel = soundEnabled ? t.practice.soundOn : t.practice.soundOff;

  return (
    <>
      <Button variant="outline" onClick={onToggleSpeed} title={t.practice.speedHint}>
        <Volume2 />
        {t.practice.speed}: {speechRate === NORMAL_RATE ? "1.0x" : "0.75x"}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleSound}
        aria-label={soundLabel}
        aria-pressed={!soundEnabled}
        title={soundLabel}
      >
        {soundEnabled ? <Volume1 /> : <VolumeX className="text-muted-foreground" />}
      </Button>
    </>
  );
}
