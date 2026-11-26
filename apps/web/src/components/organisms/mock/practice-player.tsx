"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Slider } from "@/components/atoms/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/atoms/toggle-group";
import {
  formatTrackTime,
  PLAYBACK_RATES,
  SEEK_STEPS,
  seekBy,
  type PlaybackRate,
} from "@/lib/mock-player";

type Track = {
  playing: boolean;
  current: number;
  duration: number;
};

/** Mirrors the audio element's state so the controls stay in step with it. */
function useTrack(audioRef: RefObject<HTMLAudioElement | null>) {
  const [track, setTrack] = useState<Track>({ playing: false, current: 0, duration: Number.NaN });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () =>
      setTrack({ playing: !audio.paused, current: audio.currentTime, duration: audio.duration });
    const events = ["play", "pause", "timeupdate", "durationchange", "loadedmetadata", "seeked", "ended"];
    events.forEach((name) => audio.addEventListener(name, sync));
    sync();
    return () => events.forEach((name) => audio.removeEventListener(name, sync));
  }, [audioRef]);

  return track;
}

function SkipButton({ seconds, onSkip }: { seconds: number; onSkip: (delta: number) => void }) {
  const back = seconds < 0;
  const Icon = back ? RotateCcw : RotateCw;
  const amount = Math.abs(seconds);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1 px-2 font-mono text-xs tabular-nums"
      aria-label={back ? `Back ${amount} seconds` : `Forward ${amount} seconds`}
      onClick={() => onSkip(seconds)}
    >
      {back ? <Icon className="size-3.5" aria-hidden /> : null}
      {amount}
      {back ? null : <Icon className="size-3.5" aria-hidden />}
    </Button>
  );
}

/**
 * The listening recording with full controls, for practice sittings only.
 * It stops whenever the section clock is paused.
 */
export function PracticePlayer({
  src,
  clockPaused,
  onFailed,
}: {
  src: string;
  clockPaused: boolean;
  onFailed: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = useTrack(audioRef);
  const [rate, setRate] = useState<PlaybackRate>(1);

  useEffect(() => {
    if (clockPaused) audioRef.current?.pause();
  }, [clockPaused]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(onFailed);
    } else {
      audio.pause();
    }
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = seconds;
  };

  const skip = (delta: number) => seekTo(seekBy(track.current, delta, track.duration));
  const ready = Number.isFinite(track.duration) && track.duration > 0;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
      <audio ref={audioRef} src={src} preload="auto" onError={onFailed} />
      <div className="flex flex-wrap items-center gap-1">
        {SEEK_STEPS.map((step) => (
          <SkipButton key={`back-${step}`} seconds={-step} onSkip={skip} />
        ))}
        <Button
          type="button"
          size="icon"
          aria-label={track.playing ? "Pause the recording" : "Play the recording"}
          disabled={clockPaused}
          onClick={toggle}
        >
          {track.playing ? <Pause /> : <Play />}
        </Button>
        {[...SEEK_STEPS].reverse().map((step) => (
          <SkipButton key={`forward-${step}`} seconds={step} onSkip={skip} />
        ))}
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={String(rate)}
          onValueChange={(value) => {
            const next = PLAYBACK_RATES.find((option) => String(option) === value);
            if (next) setRate(next);
          }}
          aria-label="Playback speed"
          className="ml-auto"
        >
          {PLAYBACK_RATES.map((option) => (
            <ToggleGroupItem key={option} value={String(option)} className="px-2 font-mono text-xs tabular-nums">
              {option}×
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 font-mono text-xs tabular-nums text-muted-foreground">
          {formatTrackTime(track.current)}
        </span>
        <Slider
          min={0}
          max={ready ? track.duration : 1}
          step={1}
          value={[ready ? track.current : 0]}
          disabled={!ready}
          onValueChange={([value]) => {
            if (value != null) seekTo(value);
          }}
          aria-label="Position in the recording"
          className="flex-1"
        />
        <span className="w-12 text-right font-mono text-xs tabular-nums text-muted-foreground">
          {formatTrackTime(track.duration)}
        </span>
      </div>
    </div>
  );
}
