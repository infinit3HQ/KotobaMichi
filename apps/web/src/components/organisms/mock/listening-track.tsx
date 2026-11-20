"use client";

import { useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { listeningAudioUrl } from "@/lib/mock-exam";

/** Plays the listening recording once. If it fails, the page falls back to the printed script. */
export function ListeningTrack({ examId, onFailed }: { examId: string; onFailed: () => void }) {
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
      <Alert>
        <Volume2 />
        <AlertDescription>
          The recording did not load, so the question text from the script is on the page. 問題3 and 問題5 speak
          their choices.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
      <audio ref={audioRef} src={listeningAudioUrl(examId)} preload="auto" onError={fail} />
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
