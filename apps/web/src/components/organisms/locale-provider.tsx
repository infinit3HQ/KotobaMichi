"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionary";
import {
  LEGACY_LOCALE_STORAGE_KEY,
  localeCookieString,
  parseLocale,
  readLocaleCookie,
} from "@/lib/i18n/locale-cookie";

type LocaleContextValue = {
  /**
   * The language lesson content renders in. Stays "en" until the Sinhala
   * glosses finish loading, so content never mixes half-loaded text.
   */
  locale: Locale;
  /** The language the learner picked. UI labels follow this right away. */
  selectedLocale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>(initialLocale);
  // Starts false on both server and client so hydration matches.
  const [contentReady, setContentReady] = useState(false);

  const setLocale = useCallback((next: Locale) => {
    setSelectedLocale(next);
    document.cookie = localeCookieString(next);
    try {
      window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the cookie is enough.
    }
  }, []);

  // Carry over a choice saved by older builds before the cookie existed.
  useEffect(() => {
    if (readLocaleCookie(document.cookie)) return;
    let saved: Locale | null = null;
    try {
      saved = parseLocale(window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY));
    } catch {
      saved = null;
    }
    if (saved) setLocale(saved);
  }, [setLocale]);

  useEffect(() => {
    if (selectedLocale !== "si") return;
    let cancelled = false;
    // Imported lazily so pages without lesson content never download the gloss module.
    import("@/lib/i18n/content-si")
      .then((content) => content.loadSinhalaContent())
      .then(() => {
        if (!cancelled) setContentReady(true);
      })
      .catch(() => {
        // Lesson content stays in English if the glosses fail to load.
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLocale]);

  useEffect(() => {
    document.documentElement.lang = selectedLocale === "si" ? "si" : "en";
    document.documentElement.classList.toggle("locale-si", selectedLocale === "si");
  }, [selectedLocale]);

  const locale: Locale = selectedLocale === "si" && contentReady ? "si" : "en";

  return (
    <LocaleContext.Provider value={{ locale, selectedLocale, setLocale, t: dictionaries[selectedLocale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}

export function LocaleSwitch({ className = "" }: { className?: string }) {
  const { selectedLocale: locale, setLocale } = useLocale();
  return (
    <div
      className={`inline-flex h-9 items-center rounded-full border border-border/80 bg-background/70 p-0.5 text-xs font-bold ${className}`}
      role="group"
      aria-label="Language"
    >
      {(
        [
          ["en", "EN"],
          ["si", "සිං"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          className={`min-h-8 rounded-full px-2.5 ${
            locale === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
          aria-pressed={locale === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
