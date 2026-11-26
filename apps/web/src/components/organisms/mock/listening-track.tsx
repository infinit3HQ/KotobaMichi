"use client";

import { useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { PracticePlayer } from "@/components/organisms/mock/practice-player";
import { canPause, type MockMode } from "@/lib/mock-clock";
import { listeningAudioUrl } from "@/lib/mock-exam";

/** Plays the recording once, straight through, like the real exam. */
function StrictTrack({ src, onFailed }: { src: string; onFailed: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(onFailed);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
      <audio ref={audioRef} src={src} preload="auto" onError={onFailed} />
      {playing ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Volume2 className="size-4" aria-hidden />
          The recording is playing once, straight through.
        </p>
      ) : (
        <Button type="button" onClick={start}>
          <Play />
          Play the recording
        </Button>
      )}
    </div>
  );
}

/**
 * The listening recording. Strict sittings play it once; practice sittings get full controls.
 * If it fails to load, the page falls back to the printed script.
 */
export function ListeningTrack({
  examId,
  mode,
  paused,
  onFailed,
}: {
  examId: string;
  mode: MockMode;
  paused: boolean;
  onFailed: () => void;
}) {
  const [failed, setFailed] = useState(false);

  const fail = () => {
    setFailed(true);
    onFailed();
  };

  if (failed) {
    return (
      <Alert>
        <Volume2 />
        <AlertDescription>
          The recording did not load, so the question text from the script is on the page. 問題3 and 問題5 speak
          their choices.
        </AlertDescription>
      </Alert>
    );
  }

  const src = listeningAudioUrl(examId);
  return canPause(mode) ? (
    <PracticePlayer src={src} clockPaused={paused} onFailed={fail} />
  ) : (
    <StrictTrack src={src} onFailed={fail} />
  );
}
