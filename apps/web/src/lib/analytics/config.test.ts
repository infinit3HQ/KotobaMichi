import { describe, expect, it } from "vitest";
import { DEFAULT_POSTHOG_KEY, ingestHosts, parseRegion, resolveAnalyticsConfig } from "./config";

describe("parseRegion", () => {
  it("defaults to us", () => {
    expect(parseRegion(undefined)).toBe("us");
    expect(parseRegion("mars")).toBe("us");
  });
  it("accepts eu in any case", () => {
    expect(parseRegion(" EU ")).toBe("eu");
  });
});

describe("ingestHosts", () => {
  it("builds the regional hosts", () => {
    expect(ingestHosts("eu")).toEqual({
      api: "https://eu.i.posthog.com",
      assets: "https://eu-assets.i.posthog.com",
      ui: "https://eu.posthog.com",
    });
  });
});

describe("resolveAnalyticsConfig", () => {
  it("uses the default key through the proxy in production", () => {
    expect(resolveAnalyticsConfig({}, "production")).toEqual({
      key: DEFAULT_POSTHOG_KEY,
      apiHost: "/ingest",
      uiHost: "https://us.posthog.com",
    });
  });

  it("prefers the runtime key over the build key", () => {
    const config = resolveAnalyticsConfig(
      { runtime: { NEXT_PUBLIC_POSTHOG_KEY: "phc_runtime" }, build: { NEXT_PUBLIC_POSTHOG_KEY: "phc_build" } },
      "production"
    );
    expect(config?.key).toBe("phc_runtime");
  });

  it("falls back past blank runtime values", () => {
    const config = resolveAnalyticsConfig(
      { runtime: { NEXT_PUBLIC_POSTHOG_KEY: "  " }, build: { NEXT_PUBLIC_POSTHOG_KEY: "phc_build" } },
      "production"
    );
    expect(config?.key).toBe("phc_build");
  });

  it("turns off when the key is off", () => {
    expect(resolveAnalyticsConfig({ runtime: { NEXT_PUBLIC_POSTHOG_KEY: "OFF" } }, "production")).toBeNull();
  });

  it("stays off in development unless opted in", () => {
    expect(resolveAnalyticsConfig({}, "development")).toBeNull();
    expect(resolveAnalyticsConfig({ build: { NEXT_PUBLIC_POSTHOG_DEV: "true" } }, "development")).not.toBeNull();
  });

  it("uses the eu ui host for the eu region", () => {
    const config = resolveAnalyticsConfig({ runtime: { NEXT_PUBLIC_POSTHOG_REGION: "eu" } }, "production");
    expect(config?.uiHost).toBe("https://eu.posthog.com");
  });
});
