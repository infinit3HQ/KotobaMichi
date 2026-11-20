# KotobaMichi (言葉道)

The open-source platform designed to make learning the Japanese language fast, engaging, and accessible for everyone.

## Repository layout

A pnpm workspace, with tasks run through [Turborepo](https://turborepo.com).

```
apps/
  web/        @kotobamichi/web   Next.js 15 frontend: practice dojo, SRS flashcards, mock exams
  api/        @kotobamichi/api   NestJS REST API: PostgreSQL + pgvector, Drizzle, Google OAuth, JWT
packages/
  srs/        @kotobamichi/srs   FSRS scheduler settings shared by web (guest reviews) and api
content/
  exams/      JLPT mock exam sources; images are copied into apps/web/public/exams at build time
deploy/
  api/        Production compose stack for the API, database and migrations
  web/        Production compose stack for the frontend
scripts/      Repo-level content tooling
```

Each app's Dockerfile builds from the repository root, so the root `pnpm-lock.yaml` is the only lockfile.

## Quick start

Requires Node.js 24 or newer (26 recommended, see `.nvmrc`) and pnpm 12 (`corepack enable`).

```bash
pnpm install
pnpm dev          # web and api together
pnpm dev:web      # frontend only, http://localhost:3000
pnpm dev:api      # API only
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for environment files and the database.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check        # all four, as CI runs them
```

Turbo builds `packages/*` before the apps that depend on them and caches results in `.turbo/`.
To run a task for one app and what it depends on: `pnpm turbo run test --filter=@kotobamichi/api...`

## CI/CD

Workflows live in [`.github/workflows/`](./.github/workflows/):

- **`ci.yml`**: lints, typechecks, tests and builds whichever app changed (a change in `packages/` checks both).
- **`deploy-frontend.yml`**: builds `apps/web/Dockerfile`, publishes `ghcr.io/infinit3hq/kotobamichi-web`, and runs `deploy/web` on the server.
- **`deploy-backend.yml`**: builds `apps/api/Dockerfile` and `Dockerfile.migration`, publishes `ghcr.io/infinit3hq/kotobamichi-api` and `kotobamichi-migration`, and runs `deploy/api` on the server.

### Production secrets

The API's settings live on the server in `/etc/kotobamichi/api.env` (root-only, mode 600), outside the
checkout. `deploy-backend.yml` copies that file into `deploy/api/.env` and overlays the Google OAuth and
S3 values from the `production` GitHub environment (secrets for keys, variables for URLs, bucket and region).
Only `main` can deploy to that environment, and the repository itself holds no secrets. There are no fallback values: if the file or a required key is missing,
the deploy stops. To change a secret, edit that file on the server and re-run the workflow.

In production the API refuses to start if `JWT_SECRET` is missing, shorter than 32 characters,
or one of the example values published in this repository.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Code is released under the [MIT License](./LICENSE). Third-party data credits are in [NOTICE.md](./NOTICE.md).

---
Maintained by [infinit3HQ](https://github.com/infinit3HQ).
