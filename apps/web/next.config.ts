import path from "node:path";
import type { NextConfig } from "next";

// Trace from the monorepo root so the standalone bundle includes workspace packages.
const monorepoRoot = path.join(__dirname, "..", "..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
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
