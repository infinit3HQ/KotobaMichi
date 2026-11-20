# Build from the repository root:
#   docker build -f apps/api/Dockerfile .
FROM node:26.12.1-alpine AS base
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@12.15.0
WORKDIR /repo

FROM base AS builder
# Build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++
# Every workspace manifest, so the root lockfile matches and --frozen-lockfile passes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/srs/package.json packages/srs/
RUN pnpm install --frozen-lockfile --filter "@kotobamichi/api..."
COPY packages/srs packages/srs
COPY apps/api apps/api
# Builds @kotobamichi/srs first, then the API; then copies the API with prod deps only
RUN pnpm --filter "@kotobamichi/api..." run build \
  && pnpm --filter @kotobamichi/api deploy --prod /out

FROM node:26.12.1-alpine AS production
RUN apk add --no-cache curl \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /out/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /out/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /out/dist ./dist
COPY --chown=nestjs:nodejs apps/api/drizzle ./drizzle
COPY --chown=nestjs:nodejs apps/api/drizzle.config.ts ./drizzle.config.ts
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1
CMD ["node", "dist/main"]
