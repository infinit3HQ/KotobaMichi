import path from "node:path";
import type { NextConfig } from "next";
import { ingestHosts, parseRegion, POSTHOG_PROXY_PATH } from "./src/lib/analytics/config";

// Trace from the monorepo root so the standalone bundle includes workspace packages.
const monorepoRoot = path.join(__dirname, "..", "..");

// Rewrites are fixed at build time, so the region comes from the build env.
const posthogHosts = ingestHosts(parseRegion(process.env.NEXT_PUBLIC_POSTHOG_REGION));

const nextConfig: NextConfig = {
  // PostHog's API paths end in a slash; Next must not redirect them.
  skipTrailingSlashRedirect: true,
  output: "standalone",
  devIndicators: false,
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
  async rewrites() {
    return [
      { source: `${POSTHOG_PROXY_PATH}/static/:path*`, destination: `${posthogHosts.assets}/static/:path*` },
      { source: `${POSTHOG_PROXY_PATH}/array/:path*`, destination: `${posthogHosts.assets}/array/:path*` },
      { source: `${POSTHOG_PROXY_PATH}/:path*`, destination: `${posthogHosts.api}/:path*` },
    ];
  },
  async headers() {
    return [
      {
        // Browsers must re-check the worker on every visit so updates roll out.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
