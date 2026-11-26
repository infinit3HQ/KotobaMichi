import posthog from "posthog-js";
import { resolveAnalyticsConfig } from "./config";
import { redactEvent, redactUrl } from "./redact";
import { deviceContext } from "./context";
import type { AnalyticsEvents } from "./events";

export type { AnalyticsEvents } from "./events";

let started = false;

// Next.js only inlines NEXT_PUBLIC_* values referenced literally, so list them one by one.
function buildEnv(): Record<string, string | undefined> {
  return {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_REGION: process.env.NEXT_PUBLIC_POSTHOG_REGION,
    NEXT_PUBLIC_POSTHOG_DEV: process.env.NEXT_PUBLIC_POSTHOG_DEV,
  };
}

/** Starts PostHog once in the browser. Safe to call repeatedly; a no-op when analytics is off. */
export function initAnalytics(): boolean {
  if (started || typeof window === "undefined") return started;
  // Hot reload can re-run this module while the SDK stays loaded.
  if (posthog.__loaded) {
    started = true;
    return started;
  }
  const config = resolveAnalyticsConfig({ runtime: window.__ENV__, build: buildEnv() }, process.env.NODE_ENV);
  if (!config) return false;
  try {
    posthog.init(config.key, {
      api_host: config.apiHost,
      ui_host: config.uiHost,
      // Pins SDK behaviour, including pageviews on client-side (history) navigation.
      defaults: "2026-01-30",
      capture_pageview: "history_change",
      capture_pageleave: true,
      // Clicks, form submits, rage clicks and copied text, with element details.
      autocapture: true,
      rageclick: true,
      capture_dead_clicks: true,
      enable_heatmaps: true,
      capture_exceptions: true,
      // Web vitals (LCP, CLS, INP, FCP) and network timings.
      capture_performance: { web_vitals: true, network_timing: true },
      // Anonymous visitors get person profiles too, so country and device show per person.
      person_profiles: "always",
      enable_recording_console_log: true,
      session_recording: {
        maskAllInputs: true,
        recordHeaders: true,
        recordBody: false,
        maskCapturedNetworkRequestFn: (request) => ({ ...request, name: redactUrl(request.name) }),
      },
      // Reset-password and verify-email links carry one-time tokens in the URL.
      before_send: (event) => (event ? redactEvent(event) : event),
      loaded: (client) => client.register(deviceContext()),
    });
    started = true;
  } catch (error) {
    console.error("PostHog failed to start", error);
  }
  return started;
}

export function isAnalyticsOn() {
  return started;
}

export function identifyUser(user: { id: string; email: string; role: string }) {
  if (!started) return;
  posthog.register({ signed_in: true, user_role: user.role });
  if (posthog.get_distinct_id() === user.id) return;
  posthog.identify(user.id, { email: user.email, role: user.role }, { first_seen_app_at: new Date().toISOString() });
}

export function resetUser() {
  if (!started) return;
  posthog.reset();
  posthog.register({ ...deviceContext(), signed_in: false });
}

/** Adds properties sent with every later event, such as the UI language or theme. */
export function setContext(properties: Record<string, string | number | boolean>) {
  if (!started) return;
  posthog.register(properties);
}

/** Sets properties on the current person, for example their exam goal. */
export function setPersonProperties(properties: Record<string, unknown>) {
  if (!started) return;
  posthog.setPersonProperties(properties);
}

export function captureError(error: unknown, properties?: Record<string, unknown>) {
  if (!started) return;
  posthog.captureException(error, properties);
}

export function track<E extends keyof AnalyticsEvents>(event: E, properties: AnalyticsEvents[E]) {
  if (!started) return;
  posthog.capture(event, properties);
}
