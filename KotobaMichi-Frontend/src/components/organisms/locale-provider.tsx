"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "kotoba-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "si" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "si" ? "si" : "en";
    document.documentElement.classList.toggle("locale-si", locale === "si");
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
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
  const { locale, setLocale } = useLocale();
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
