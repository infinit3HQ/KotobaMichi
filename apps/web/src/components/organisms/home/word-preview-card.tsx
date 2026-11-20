"use client";

import { useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/organisms/locale-provider";
import { speakJapanese } from "@/lib/audio";
import { cn } from "@/lib/utils";

/** The flip card in the landing hero: the app's name, read, heard and explained. */
export function WordPreviewCard() {
  const { t } = useLocale();
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);

  const play = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (playing) return;
    setPlaying(true);
    try {
      await speakJapanese("言葉道", {
        onEnd: () => setPlaying(false),
        onError: () => setPlaying(false),
      });
    } finally {
      setPlaying(false);
    }
  };

  const face = "absolute inset-0 flex flex-col rounded-2xl border bg-card p-5 shadow-sm backface-hidden";

  return (
    <div className="w-full max-w-sm">
      <p className="mb-3 text-center text-xs font-medium text-muted-foreground">{t.home.previewLabel}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((value) => !value);
          }
        }}
        aria-pressed={flipped}
        aria-label={flipped ? t.home.flipBack : t.home.tapReveal}
        className="perspective block h-64 w-full cursor-pointer select-none rounded-2xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          className={cn(
            "relative block h-full w-full rounded-2xl transition-transform duration-500 preserve-3d motion-reduce:transition-none",
            flipped && "rotate-y-180"
          )}
        >
          <span className={cn(face, "border-border")}>
            <span className="flex items-center justify-between">
              <Badge variant="secondary">N5</Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label={t.home.pronounce}
                onClick={play}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Volume2 className={cn(playing && "text-primary")} />
              </Button>
            </span>
            <span className="my-auto flex flex-col items-center gap-1 text-center">
              <span className="font-jp text-sm text-primary">ことばみち</span>
              <span className="font-jp text-5xl font-bold tracking-tight">言葉道</span>
              <span className="font-mono text-xs text-muted-foreground">kotobamichi</span>
            </span>
            <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="size-3" />
              {t.home.tapReveal}
            </span>
          </span>

          <span className={cn(face, "rotate-y-180 border-primary/30")}>
            <span className="flex items-center justify-between">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {t.home.meaning}
              </Badge>
            </span>
            <span className="my-auto flex flex-col items-center gap-2 text-center">
              <span className="text-2xl font-semibold tracking-tight">{t.home.pathTitle}</span>
              <span className="font-jp text-sm text-muted-foreground">{t.home.pathDesc}</span>
            </span>
            <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="size-3" />
              {t.home.flipBack}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
