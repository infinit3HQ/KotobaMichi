#!/bin/sh
set -e

# public/ sits next to server.js inside the standalone monorepo layout
PUBLIC_DIR="${PUBLIC_DIR:-/app/apps/web/public}"
mkdir -p "$PUBLIC_DIR"

# Runtime configuration for the browser. Storage credentials stay on the API.
RUNTIME_API_URL="${NEXT_PUBLIC_API_URL}"
RUNTIME_S3_PUBLIC_URL="${NEXT_PUBLIC_S3_PUBLIC_URL:-https://s3-kotobamichi.012140.xyz/kotobamichi}"
# Optional: override the PostHog key baked into the bundle, or set it to "off".
RUNTIME_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY:-}"

js_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# Generate env.js for client-side runtime consumption
cat > "$PUBLIC_DIR/env.js" <<EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "$(js_escape "$RUNTIME_API_URL")",
  NEXT_PUBLIC_S3_PUBLIC_URL: "$(js_escape "$RUNTIME_S3_PUBLIC_URL")",
  NEXT_PUBLIC_POSTHOG_KEY: "$(js_escape "$RUNTIME_POSTHOG_KEY")"
};
EOF

# Exec original command
exec "$@"
