# Proposed Next.js App Router Project Structure

Date: 2025-08-16

This proposal reorganizes the project to follow Next.js App Router best practices from the official docs while minimizing disruption. It keeps routes in `src/app` and moves shared, non-route code out of `app` to `src/*` to avoid coupling and server/client boundary confusion.

## Goals

- Keep `src/app` for routes, layouts, and route-bound files only
- Move UI, hooks, stores, utils, and types to `src/*`
- Introduce route groups for clearer segmentation (auth vs app)
- Keep shadcn/ui conventions and simplify imports with `@` alias pointing to `src`
- Make future feature modularization easy (optional `src/features/*`)

## Proposed Folder Structure

```
/ (repo root)
├─ public/                         # Static assets
├─ src/
│  ├─ app/                         # App Router: layouts, pages, route handlers
│  │  ├─ (auth)/                   # Route group: public/auth
│  │  │  ├─ login/                 # /auth/login
│  │  │  │  └─ page.tsx
│  │  │  └─ register/              # /auth/register
│  │  │     └─ page.tsx
│  │  ├─ (app)/                    # Route group: authenticated app shell
│  │  │  ├─ layout.tsx             # Nav/Sidebar/Footer shell for authed area
│  │  │  ├─ dashboard/             # /dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ profile/               # /profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ quizzes/               # /quizzes
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  └─ results/
│  │  │     └─ [attemptId]/
│  │  │        └─ page.tsx
│  │  ├─ words/                    # /words (public or app depending on usage)
│  │  ├─ api/                      # (optional) Route handlers
│  │  ├─ favicon.ico
│  │  ├─ globals.css               # Global styles loaded once
│  │  ├─ layout.tsx                # Root layout (theme, providers)
│  │  ├─ not-found.tsx             # 404 for routes without match
│  │  ├─ page.tsx                  # Landing page
│  │  └─ providers.tsx             # App-wide providers (wrapped in root layout)
│  │
│  ├─ components/                  # Shared UI (client and server components)
│  │  ├─ atoms/                    # shadcn ui primitives (current "atoms")
│  │  ├─ molecules/                # Composed components
│  │  ├─ organisms/                # Higher-level comps (Navbar, Footer, etc.)
│  │  ├─ layout/                   # Optional: layout-only building blocks
│  │  └─ icons/                    # Optional: SVG/React icon components
│  │
│  ├─ hooks/                       # Reusable hooks (client-only unless marked)
│  ├─ lib/                         # Utilities (pure/shared) and API helpers
│  │  ├─ api/                      # API client wrappers (axios, fetch)
│  │  ├─ server/                   # Server-only helpers (mark with `server-only`)
│  │  └─ utils.ts                  # General utilities
│  ├─ stores/                      # Zustand stores and related helpers
│  ├─ types/                       # Shared types (e.g., API types)
│  ├─ styles/                      # Optional: non-global css, tailwind additions
│  └─ features/                    # (Optional, Phase 2) domain modules
│     └─ auth/                     #   Feature: auth-specific components/hooks
│        ├─ components/
│        ├─ hooks/
│        └─ lib/
│
├─ components.json                 # shadcn config (aliases align to src/*)
├─ next.config.ts
├─ tsconfig.json                   # @ alias -> src
├─ package.json
└─ ...
```

Notes
- The current `src/app/components/*` content moves to `src/components/*`.
- Keep `globals.css` under `src/app` (Next.js default). All other styles can live in `src/styles`.
- Consider consolidating duplicated `not-found` UI into a single component in `src/components` and keep route-level `app/not-found.tsx` as a thin wrapper.

## TSConfig and Aliases

Change the baseUrl to `src` so `@/*` points at the entire source tree (not `src/app`). This lets `@/components`, `@/lib`, etc. resolve cleanly and matches Next.js examples.

Before (current):

```jsonc
{
  "compilerOptions": {
    // ...
    "baseUrl": "./src/app",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

After (proposed):

```jsonc
{
  "compilerOptions": {
    // ...existing options...
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      // Optional explicit conveniences:
      "components/*": ["components/*"],
      "lib/*": ["lib/*"],
      "hooks/*": ["hooks/*"],
      "stores/*": ["stores/*"],
      "types/*": ["types/*"]
    }
  }
}
```

shadcn config (`components.json`)
- No change needed to `aliases` if `@` maps to `src`:
  - `"components": "@/components"`
  - `"ui": "@/components/atoms"` (keeps your current atoms naming)
  - `"lib": "@/lib"`, `"hooks": "@/hooks"`
- Keep `tailwind.css` at `src/app/globals.css`.

Optional: You may prefer shadcn’s conventional `ui` folder over `atoms`. If you want that, rename `src/components/atoms -> src/components/ui` and update the `ui` alias to `@/components/ui`.

## Route Groups and Layouts

Introduce route groups to improve clarity and allow dedicated layouts:
- `(auth)`: public routes for login/register with a minimal layout
- `(app)`: authenticated shell containing Navbar/Sidebar/Footer

Your existing pages would map like:
- `src/app/auth/login/page.tsx` -> `src/app/(auth)/login/page.tsx`
- `src/app/auth/register/page.tsx` -> `src/app/(auth)/register/page.tsx`
- `src/app/dashboard/page.tsx` -> `src/app/(app)/dashboard/page.tsx`
- `src/app/profile/page.tsx` -> `src/app/(app)/profile/page.tsx`
- `src/app/quizzes/**` -> `src/app/(app)/quizzes/**`
- `src/app/results/**` -> `src/app/(app)/results/**`

Move shell components (Navbar, Footer, ProtectedRoute wrapper if still needed) out of `app` into `src/components/organisms` or `src/components/layout`, and import them in `(app)/layout.tsx`.

## Proposed Migration Plan (Low-Risk, Two Phases)

Phase 1 — Safe relayout and aliases
1) Create a branch: `chore/structure-refactor`
2) Update `tsconfig.json` baseUrl and paths as above
3) Move directories:
   - `src/app/components/**/*` -> `src/components/**/*`
   - `src/app/hooks/**/*` -> `src/hooks/**/*`
   - `src/app/lib/**/*` -> `src/lib/**/*`
   - `src/app/stores/**/*` -> `src/stores/**/*`
   - `src/app/types/**/*` -> `src/types/**/*`
4) Fix imports (most resolve via `@` automatically after baseUrl change). For any broken paths, change `@/app/...` to `@/...` and `@/components/...` etc.
5) Keep `globals.css`, `layout.tsx`, `providers.tsx`, pages, and route handlers inside `src/app`.
6) Ensure `components.json` aliases still point to `@/components`, `@/lib`, `@/hooks`.

Phase 2 — Route groups and shell
1) Create `(auth)` and `(app)` route groups under `src/app`
2) Move the routes as mapped above
3) Create `src/app/(app)/layout.tsx` that renders Navbar/Sidebar/Footer and children
4) Simplify route-level `not-found.tsx` to import a single `NotFound` component from `src/components`

## Windows PowerShell: Suggested Commands (Optional)

These are optional helpers. Review the changes locally and commit in meaningful chunks.

```powershell
# Branch
git checkout -b chore/structure-refactor

# Moves (preserve history)
git mv src/app/components src/components
mkdir src/hooks; if (Test-Path src/app/hooks) { git mv src/app/hooks/* src/hooks/ }
mkdir src/lib; if (Test-Path src/app/lib) { git mv src/app/lib/* src/lib/ }
mkdir src/stores; if (Test-Path src/app/stores) { git mv src/app/stores/* src/stores/ }
mkdir src/types; if (Test-Path src/app/types) { git mv src/app/types/* src/types/ }

# Commit frequently
git add -A
git commit -m "chore(structure): move shared code out of app to src/*"
```

After updating `tsconfig.json`, restart the TS server in your editor to clear stale path caches.

## Server/Client Boundaries

- Use `server-only` for modules that must never run on the client (e.g., DB helpers). Place them in `src/lib/server/*` and add `import 'server-only'` in those files.
- Put client-only hooks and Zustand stores under `src/hooks` and `src/stores` with `"use client"` where needed.
- UI components can be server by default; add `"use client"` only where necessary.

## Next Steps

- Approve this structure
- I’ll apply Phase 1 (moves + alias updates) and run a quick build/lint pass
- Then I’ll introduce route groups and adjust layouts (Phase 2)

If you’d like, we can also adopt a `src/features/*` setup for domain-driven components incrementally starting with `auth`.
