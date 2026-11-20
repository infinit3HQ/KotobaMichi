import { describe, expect, it } from "vitest";
import { localeCookieString, parseLocale, readLocaleCookie } from "@/lib/i18n/locale-cookie";

describe("locale cookie", () => {
  it("accepts only known locales", () => {
    expect(parseLocale("si")).toBe("si");
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("fr")).toBeNull();
    expect(parseLocale(undefined)).toBeNull();
  });

  it("reads the locale among other cookies", () => {
    expect(readLocaleCookie("a=1; kotoba-locale=si; b=2")).toBe("si");
    expect(readLocaleCookie("a=1")).toBeNull();
    expect(readLocaleCookie("kotoba-locale=xx")).toBeNull();
  });

  it("writes a cookie it can read back", () => {
    const written = localeCookieString("si").split(";")[0] ?? "";
    expect(readLocaleCookie(written)).toBe("si");
    expect(localeCookieString("en")).toContain("Path=/");
  });
});
