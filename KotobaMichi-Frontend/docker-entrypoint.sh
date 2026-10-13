#!/bin/sh
set -e

# Create public dir if it doesn't exist (should exist)
mkdir -p /app/public

# Runtime configuration for the browser. Storage credentials stay on the API.
RUNTIME_API_URL="${NEXT_PUBLIC_API_URL}"
RUNTIME_S3_PUBLIC_URL="${NEXT_PUBLIC_S3_PUBLIC_URL:-https://s3-kotobamichi.012140.xyz/kotobamichi}"

js_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# Generate env.js for client-side runtime consumption
cat > /app/public/env.js <<EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "$(js_escape "$RUNTIME_API_URL")",
  NEXT_PUBLIC_S3_PUBLIC_URL: "$(js_escape "$RUNTIME_S3_PUBLIC_URL")"
};
EOF

# Exec original command
exec "$@"
