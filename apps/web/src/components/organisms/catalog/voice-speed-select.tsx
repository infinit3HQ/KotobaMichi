"use client";

import { Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { SPEECH_RATES, type SpeechRateKey } from "./catalog-types";

const RATE_LABELS: Record<SpeechRateKey, string> = { normal: "1.0×", slow: "0.75×" };

type VoiceSpeedSelectProps = {
  value: SpeechRateKey;
  onValueChange: (value: SpeechRateKey) => void;
  label: string;
  formatOption: (rate: string) => string;
};

/** Voice speed picker for the page header. Same 36px height as the primary button next to it. */
export function VoiceSpeedSelect({ value, onValueChange, label, formatOption }: VoiceSpeedSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as SpeechRateKey)}>
      <SelectTrigger aria-label={label} className="w-auto">
        <Volume2 className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {(Object.keys(SPEECH_RATES) as SpeechRateKey[]).map((key) => (
          <SelectItem key={key} value={key}>
            {formatOption(RATE_LABELS[key])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
