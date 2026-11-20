"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Which cards are flipped to their back, keyed by item id. */
export function useFlipState() {
  const [flipped, setFlipped] = useState<Readonly<Record<string, boolean>>>({});

  const toggle = useCallback((id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const revealAll = useCallback((ids: readonly string[]) => {
    setFlipped(Object.fromEntries(ids.map((id) => [id, true])));
  }, []);

  const reset = useCallback(() => setFlipped({}), []);

  return { flipped, toggle, revealAll, reset };
}

/** Focuses the returned input ref when the student presses "/" outside a text field. */
export function useSlashToFocus() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return inputRef;
}
