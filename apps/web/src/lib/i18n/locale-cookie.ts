import type { Locale } from "@/lib/i18n/dictionary";

/** Cookie the server reads to render the chosen language on first paint. */
export const LOCALE_COOKIE = "kotoba-locale";
/** Older builds kept the choice in localStorage under the same name. */
export const LEGACY_LOCALE_STORAGE_KEY = "kotoba-locale";

export function parseLocale(value: string | undefined | null): Locale | null {
  return value === "si" || value === "en" ? value : null;
}

export function readLocaleCookie(cookie: string): Locale | null {
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === LOCALE_COOKIE) return parseLocale(decodeURIComponent(rest.join("=")));
  }
  return null;
}

export function localeCookieString(locale: Locale) {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
