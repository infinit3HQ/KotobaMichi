// src/hooks/use-countdown.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(initialSeconds);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialSeconds == null) return;
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft <= 0) return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => (s == null ? s : Math.max(0, s - 1)));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [secondsLeft]);

  const reset = (s: number | null) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setSecondsLeft(s);
  };

  return { secondsLeft, reset, running: (secondsLeft ?? 0) > 0 };
}
