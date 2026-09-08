# Copilot instructions for this repo

This is a small Next.js (app router) TypeScript frontend. The file below gives the immediate, repo-specific knowledge an AI coding agent needs to make productive changes.

1. Big picture

- App Router living under `src/app`. Layouts/pages are server components by default (no `use client` present).
- Next.js 15 + React 19; Tailwind is used via PostCSS plugin. Static images live in `public/` and are referenced with `next/image`.

2. Key files to read before changing behavior

- `package.json` — scripts: `dev` (`next dev --turbopack`), `build`, `start`, `lint`.
- `tsconfig.json` — path alias `@/*` -> `./src/*` (use `@/` imports for source code).
- `src/app/layout.tsx` — app-level layout (imports Google fonts via `next/font/google` and exposes CSS vars).
- `src/app/page.tsx` — example page showing Tailwind usage and `next/image` with assets from `public/`.
- `src/app/globals.css` — imports Tailwind (`@import "tailwindcss"`), defines CSS variables and `prefers-color-scheme` overrides.
- `eslint.config.mjs` — project ESLint setup (FlatCompat extending `next/*`).
- `postcss.config.mjs` — Tailwind PostCSS plugin enabled.

3. Developer workflows (commands discovered in repo)

- Install deps (repo uses standard npm-compatible scripts; the team uses pnpm in local environment):
  - `pnpm install`
- Run dev server (uses Turbopack):
  - `pnpm dev` // runs `next dev --turbopack`
- Build / start / lint:
  - `pnpm build`
  - `pnpm start`
  - `pnpm lint`

4. Project-specific conventions & patterns

- App Router / server-component first: files in `src/app` are server components by default. Add `"use client"` explicitly at top to create client components.
- Fonts: project uses `next/font/google` (see `src/app/layout.tsx`) and assigns CSS variables like `--font-geist-sans` / `--font-geist-mono` to be applied on `<body>`.
- Styling: Tailwind utility classes are used heavily in JSX. Global styles and design tokens live in `src/app/globals.css`.
- Images: Prefer `next/image` for images and place static assets in `public/` (see `src/app/page.tsx` using `/next.svg`, `/vercel.svg`).
- Imports: Use `@/` alias to import from `src/` (configured in `tsconfig.json`).
- TypeScript: `tsconfig.json` enables `strict` and `noEmit`; keep edits type-safe and avoid changing compiler options without a strong reason.
- ESLint: Project uses Next's ESLint presets via `eslint.config.mjs`; run `pnpm lint` and prefer to fix lint issues locally.

Additional UI / state / validation conventions (project-specific additions):

- Icons: Use Lucide (lucide-react) for all icons. Import icon components directly and style with Tailwind classes.

  - Example import pattern (client components):
    - `import { Camera } from "lucide-react"`
    - Use `<Camera className="w-4 h-4 inline-block" />` for sizing/color via Tailwind.
  - Prefer creating a small `src/components/icons/index.tsx` that re-exports used icons to keep imports consistent across the app.

- UI primitives / components: Prefer the (shadcn / chadcn style) component primitives when available for consistent UX (buttons, inputs, dialogs).

  - These are client components—add `"use client"` at the top of files that import them.
  - When adding chadcn-style components, follow the project's folder convention: place UI wrappers under `src/components/ui/*` and reuse them across pages.

- Validation: Use Zod for runtime validation and schema definitions.

  - Keep Zod schemas co-located with the consuming code (for small pages) or under `src/schemas/` for shared schemas.
  - Example pattern: `import { z } from "zod"; const createItemSchema = z.object({ title: z.string().min(1) });`
  - Use `createItemSchema.parse(data)` on the server and `safeParse` on the client to validate user input.

- Global state: Use Zustand for small, focused global stores.
  - Create typed store hooks under `src/store/useStore.ts`:
    - `import create from "zustand"; export const useStore = create<StoreType>((set) => ({ ... }))`
  - Prefer many small stores (one per domain area) rather than one large global object.

Notes on adding dependencies:

- When these libraries are introduced, add them to `package.json` and run `pnpm install`. Typical packages:
  - `lucide-react`, `zod`, `zustand`, and your chosen shadcn component packages (follow their install docs).

5. Integration points & external dependencies

- Next.js (v15) and React (v19) are the core framework.
- Tailwind is wired via PostCSS plugin (`postcss.config.mjs`). No backend or API routes were found in this snapshot.

6. What to do (AI agent rules of engagement)

- Minimal, targeted edits: change only the files required for the task. Preserve component public signatures when possible.
- When adding UI components, keep them under `src/` and use `@/` imports; add styles with Tailwind classes and local CSS variables in `globals.css` if needed.
- For pages/layouts, prefer server components unless client behavior (state/hooks/DOM events) is required — then add `"use client"`.
- Run the local dev flow after edits: `pnpm install` -> `pnpm dev`; run `pnpm lint` and `pnpm build` as smoke checks before creating a PR.
- If you change TypeScript path aliases or compiler options, update `tsconfig.json` and ensure `next` builds succeed.

7. Missing/not found (notes for maintainers)

- No test runner configuration (Jest/RTL) detected. If tests are requested, ask which test framework to add.
- No CI or GitHub Actions were found in the repo snapshot — assume local verification only.

If anything in this file looks incorrect or incomplete, tell me which area you want expanded (build, lint, runtime assumptions, or common edit examples) and I will iterate.
