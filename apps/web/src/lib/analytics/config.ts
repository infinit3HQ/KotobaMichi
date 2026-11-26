// PostHog project key. It is a public, write-only token, so shipping it in the bundle is expected.
export const DEFAULT_POSTHOG_KEY = "phc_xVs3joUjxeGETsyjtLwUzYhfnXScSyUppDchhMvxvJof";

// Events go through the Next.js rewrite in next.config.ts so ad blockers do not drop them.
export const POSTHOG_PROXY_PATH = "/ingest";

export type PostHogRegion = "us" | "eu";

export type AnalyticsEnv = {
  runtime?: Record<string, string | undefined>;
  build?: Record<string, string | undefined>;
};

export type AnalyticsConfig = {
  key: string;
  apiHost: string;
  uiHost: string;
};

export function parseRegion(value: string | undefined): PostHogRegion {
  return value?.trim().toLowerCase() === "eu" ? "eu" : "us";
}

export function ingestHosts(region: PostHogRegion) {
  return {
    api: `https://${region}.i.posthog.com`,
    assets: `https://${region}-assets.i.posthog.com`,
    ui: `https://${region}.posthog.com`,
  };
}

function pick(env: AnalyticsEnv, name: string): string | undefined {
  // Blank values count as unset: env.js writes "" for variables the container does not define.
  return env.runtime?.[name]?.trim() || env.build?.[name]?.trim() || undefined;
}

/**
 * Resolves the PostHog settings, runtime env (window.__ENV__) first, then build-time env.
 * Returns null when analytics should stay off: the key is set to "off", or this is a dev
 * build that has not opted in with NEXT_PUBLIC_POSTHOG_DEV=true.
 */
export function resolveAnalyticsConfig(env: AnalyticsEnv, nodeEnv: string | undefined): AnalyticsConfig | null {
  const key = pick(env, "NEXT_PUBLIC_POSTHOG_KEY") ?? DEFAULT_POSTHOG_KEY;
  if (key.toLowerCase() === "off") return null;
  if (nodeEnv === "development" && pick(env, "NEXT_PUBLIC_POSTHOG_DEV") !== "true") return null;
  const region = parseRegion(pick(env, "NEXT_PUBLIC_POSTHOG_REGION"));
  return { key, apiHost: POSTHOG_PROXY_PATH, uiHost: ingestHosts(region).ui };
}
