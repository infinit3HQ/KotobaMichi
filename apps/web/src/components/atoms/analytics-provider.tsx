"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth";
import { useLocale } from "@/components/organisms/locale-provider";
import { identifyUser, initAnalytics, resetUser, setContext, track } from "@/lib/analytics/posthog";

/** Starts PostHog after env.js has loaded and keeps identity and app context in step with the UI. */
export function AnalyticsProvider() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const { selectedLocale } = useLocale();
  const { theme, resolvedTheme } = useTheme();
  const lastUserId = useRef<string | null>(null);
  const lastLocale = useRef<string | null>(null);
  const lastTheme = useRef<string | null>(null);

  useEffect(() => {
    if (!initAnalytics()) return;
    const onInstalled = () => track("pwa_installed", {});
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  useEffect(() => {
    if (!hydrated || !initAnalytics()) return;
    if (user) {
      identifyUser(user);
      lastUserId.current = user.id;
    } else if (lastUserId.current) {
      // Signed out on this device: start a fresh anonymous person.
      resetUser();
      lastUserId.current = null;
    } else {
      setContext({ signed_in: false });
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (!initAnalytics()) return;
    setContext({ app_locale: selectedLocale });
    if (lastLocale.current && lastLocale.current !== selectedLocale) {
      track("locale_changed", { from: lastLocale.current, to: selectedLocale });
    }
    lastLocale.current = selectedLocale;
  }, [selectedLocale]);

  useEffect(() => {
    if (!theme || !initAnalytics()) return;
    setContext({ theme_setting: theme, theme_resolved: resolvedTheme ?? theme });
    if (lastTheme.current && lastTheme.current !== theme) track("theme_changed", { to: theme });
    lastTheme.current = theme;
  }, [theme, resolvedTheme]);

  return null;
}
