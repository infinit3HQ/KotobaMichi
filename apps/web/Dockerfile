# Next.js standalone build. Build from the repository root:
#   docker build -f apps/web/Dockerfile .
FROM node:26.12.1-alpine AS base
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@12.15.0
WORKDIR /repo

FROM base AS builder
# Every workspace manifest, so the root lockfile matches and --frozen-lockfile passes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/srs/package.json packages/srs/
RUN pnpm install --frozen-lockfile --filter "@kotobamichi/web..."
COPY packages/srs packages/srs
# Exam images are copied into public/exams during the build
COPY content content
COPY apps/web apps/web
RUN pnpm --filter "@kotobamichi/web..." run build

FROM node:26.12.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001

# The standalone output mirrors the monorepo, so the server lives at apps/web/server.js
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
COPY --chown=nextjs:nodejs apps/web/docker-entrypoint.sh ./docker-entrypoint.sh
# The entrypoint writes env.js into public/ as nextjs at startup
RUN chmod +x ./docker-entrypoint.sh \
  && chown nextjs:nodejs /app/apps/web/public

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
