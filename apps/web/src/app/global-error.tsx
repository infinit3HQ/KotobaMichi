"use client";

import { useEffect } from "react";
import { captureError } from "@/lib/analytics/posthog";

// Replaces the root layout when rendering fails, so it brings its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest, boundary: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FAF8F5",
          color: "#1a1a1a",
        }}
      >
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 20, opacity: 0.7 }}>The error has been reported. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
