"use client";

import { useEffect } from "react";

/** Registers /sw.js in production builds only, so dev never serves stale pages. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // The app works without it; offline support is a bonus.
    });
  }, []);
  return null;
}
