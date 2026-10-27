## Multi-stage build for Next.js (standalone)
FROM node:26.12.1-alpine AS deps
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@12.15.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.docker.yaml ./
RUN mv pnpm-workspace.docker.yaml pnpm-workspace.yaml \
  && pnpm install --frozen-lockfile

FROM node:26.12.1-alpine AS builder
RUN npm install -g pnpm@12.15.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY . .
# Build Next.js (standalone)
RUN pnpm build

FROM node:26.12.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install curl for healthcheck used in docker-compose.prod.yml
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy standalone build output and public assets only (minimal image)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Runtime env injection script (generates /public/env.js)
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
