#!/bin/sh
set -e

# Create public dir if it doesn't exist (should exist)
mkdir -p /app/public

# Use only NEXT_PUBLIC_API_URL for Next.js runtime configuration
RUNTIME_API_URL="${NEXT_PUBLIC_API_URL}"

# Generate env.js for client-side runtime consumption
cat > /app/public/env.js <<EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${RUNTIME_API_URL}"
};
EOF

# Exec original command
exec "$@"
