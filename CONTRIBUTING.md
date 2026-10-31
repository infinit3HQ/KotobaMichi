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
pnpm dev:frontend        # http://localhost:3000
```

Copy `KotobaMichi-Frontend/example.env` to `.env.local` and point
`NEXT_PUBLIC_API_URL` at your backend.

### Backend

The API needs PostgreSQL with the pgvector extension. The root
`docker-compose.yml` starts one.

```bash
cp KotobaMichi-Backend/.env.example KotobaMichi-Backend/.env
docker compose up -d db
pnpm --filter kotobamichi-backend db:drizzle:migrate
pnpm dev:backend
```

## Before you open a pull request

Run the same checks CI runs:

```bash
pnpm lint
pnpm test
pnpm build
```

- Lint must have no errors. Warnings are fine for now, but please don't add new ones.
- Add or update tests when you change scoring, scheduling, or sync logic.
  Backend tests sit next to the code as `*.spec.ts` (Jest). Frontend tests sit
  next to the code as `*.test.ts` (Vitest).
- Backend formatting follows `KotobaMichi-Backend/.prettierrc`. Run
  `pnpm --filter kotobamichi-backend format`.

## Database changes

Edit `KotobaMichi-Backend/src/db/schema.ts`, then add a migration in
`KotobaMichi-Backend/drizzle/migrations/` and list it in `meta/_journal.json`.
Migrations must be safe to run on a live database: add columns as nullable or
with defaults, and don't drop data in the same release that stops using it.

## Dependencies

When you add or upgrade a package, also refresh the per-app lockfiles that the
Docker images install from (`KotobaMichi-Frontend/pnpm-lock.yaml` and
`KotobaMichi-Backend/pnpm-lock.yaml`). Otherwise `pnpm install --frozen-lockfile`
fails during the image build. Do this from a copy of the app folder that uses
its `pnpm-workspace.docker.yaml` as `pnpm-workspace.yaml`, with
`pnpm install --lockfile-only`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/), as the history does:
`feat(practice): ...`, `fix(ci): ...`, `chore: ...`.

## License

By contributing you agree that your work is released under the [MIT License](./LICENSE).
