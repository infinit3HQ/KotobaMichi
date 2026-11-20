# Contributing to KotobaMichi

Thanks for helping. Bug reports, fixes, Sinhala translations, and new practice
content are all welcome.

## Setup

You need Node.js 24 or newer (26 is what CI and the Docker images use, see
`.nvmrc`) and pnpm 12.

```bash
corepack enable          # gives you the pnpm version pinned in package.json
pnpm install
```

pnpm only installs package versions that are at least one day old
(`minimumReleaseAge` in `pnpm-workspace.yaml`). If a brand-new release won't
install, that is why.

### Frontend

```bash
pnpm dev:web             # http://localhost:3000
```

Copy `apps/web/example.env` to `apps/web/.env.local` and point
`NEXT_PUBLIC_API_URL` at your backend.

### Backend

The API needs PostgreSQL with the pgvector extension. The root
`docker-compose.yml` starts one.

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d db
pnpm --filter @kotobamichi/api db:drizzle:migrate
pnpm dev:api
```

## Before you open a pull request

Run the same checks CI runs:

```bash
pnpm check               # lint, typecheck, test, build
```

- Lint must have no errors. Warnings are fine for now, but please don't add new ones.
- Add or update tests when you change scoring, scheduling, or sync logic.
  Backend tests sit next to the code as `*.spec.ts` (Jest). Frontend tests sit
  next to the code as `*.test.ts` (Vitest).
- Backend formatting follows `apps/api/.prettierrc`. Run
  `pnpm --filter @kotobamichi/api format`.

## Database changes

Edit `apps/api/src/db/schema.ts`, then add a migration in
`apps/api/drizzle/migrations/` and list it in `meta/_journal.json`.
Migrations must be safe to run on a live database: add columns as nullable or
with defaults, and don't drop data in the same release that stops using it.

## Shared code

Code that both apps need goes in `packages/`. `@kotobamichi/srs` holds the FSRS
settings: guest reviews are scheduled in the browser and later synced to the API,
so both sides must use the same scheduler. Packages compile to `dist/`; Turbo builds
them before the apps, and `pnpm dev` rebuilds them on change.

## Content

`content/exams/` is the only copy of the mock exam sources. `apps/web` copies the
images into `public/exams/` (gitignored) before `dev` and `build`, or on demand with
`pnpm --filter @kotobamichi/web sync:exams`.

## Dependencies

There is one lockfile, `pnpm-lock.yaml` at the root. Add packages with
`pnpm --filter @kotobamichi/<app> add <package>`. The Docker images build from the
repository root and install from that lockfile, so nothing else needs refreshing.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/), as the history does:
`feat(practice): ...`, `fix(ci): ...`, `chore: ...`.

## License

By contributing you agree that your work is released under the [MIT License](./LICENSE).
