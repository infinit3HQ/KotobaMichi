# Build stage
FROM node:26.12.1-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm and build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++ libc6-compat \
  && npm install -g pnpm@12.15.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.docker.yaml ./
RUN mv pnpm-workspace.docker.yaml pnpm-workspace.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (no Prisma client generation needed; Drizzle uses SQL migrations only)
RUN pnpm run build

# Prune dev dependencies to keep only production deps
RUN pnpm prune --prod

# Production stage
FROM node:26.12.1-alpine AS production

# Set working directory
WORKDIR /app

# Copy production node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts

# Install runtime utilities
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

# Change ownership of the app directory
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

# Start the application
CMD ["node", "dist/main"]
