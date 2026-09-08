# KotobaMichi (言葉道) - Monorepo

The open-source platform designed to make learning the Japanese language fast, engaging, and accessible for everyone.

## Architecture

This repository is structured as a **pnpm monorepo**:

- **[`KotobaMichi-Frontend`](./KotobaMichi-Frontend)**: Next.js 15 App Router frontend featuring the **Interactive Practice Dojo** (Speed Sprint, Listening Ear-Trainer, Kana Soundboard, and 3D SRS Flashcards) with zero cloud dependency on external S3 buckets.
- **[`KotobaMichi-Backend`](./KotobaMichi-Backend)**: High-performance NestJS REST API with PostgreSQL, pgvector, Drizzle ORM, Google OAuth 2.0, and JWT authentication.

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Development
Run frontend and backend simultaneously or independently:

```bash
# Run Next.js frontend dev server
pnpm dev:frontend

# Run NestJS backend dev server
pnpm dev:backend
```

### 3. Production Build
```bash
# Build both frontend and backend
pnpm build
```

## CI/CD Deployment

The repository includes GitHub Actions workflows under [`.github/workflows/`](./.github/workflows/):
- **`ci.yml`**: Validates builds and typechecks across both applications on pull requests and pushes.
- **`deploy-frontend.yml`**: Builds and publishes Docker image to GitHub Container Registry (`ghcr.io/infinit3hq/kotobamichi-frontend`) and deploys to production.
- **`deploy-backend.yml`**: Builds and publishes Docker image to GitHub Container Registry (`ghcr.io/infinit3hq/kotobamichi-backend`), runs migrations, and deploys to production.

---
Maintained by [infinit3HQ](https://github.com/infinit3HQ).
