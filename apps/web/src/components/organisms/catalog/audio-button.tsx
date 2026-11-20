"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { speakJapanese } from "@/lib/audio";
import { cn } from "@/lib/utils";

type AudioButtonProps = {
  text: string;
  rate: number;
  label: string;
  className?: string;
};

/** Ghost icon button that reads Japanese text aloud. Clicks don't reach a surrounding flip card. */
export function AudioButton({ text, rate, label, className }: AudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (playing) return;
      setPlaying(true);
      try {
        await speakJapanese(text, {
          rate,
          onEnd: () => setPlaying(false),
          onError: () => setPlaying(false),
        });
      } finally {
        setPlaying(false);
      }
    },
    [playing, rate, text]
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={play}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      className={cn("text-muted-foreground hover:text-primary", playing && "text-primary", className)}
    >
      <Volume2 />
    </Button>
  );
}
