# Kurikara Assets

Office inventory management for the Kurikaralanka campus. Visualise every item, every location, and every condition badge on an interactive 2D floor plan that you can redesign yourself.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · SQLite (Drizzle ORM) · iron-session · bcrypt · cmdk · exceljs · qrcode · Zustand

## Features

- 🗺️ **Interactive 2D Floor Plan** — Hover or click rooms to see what's inside. Health colour-coded (green → red).
- 🎨 **Floor Designer Mode** — Drag, resize, rotate, recolour, rename rooms. Add new rooms with Rect / Circle / L-shape. Undo/redo. Snap-to-grid. Persist to DB.
- 📊 **Dashboard** — Total / Good / Broken / Locations stat cards, condition donut, items-per-location chart, top-broken list.
- ⌘ **Cmd-K Search** — Spotlight-style fuzzy search across items, locations, categories. Press Ctrl+K from anywhere.
- ✏️ **CRUD** — Add, edit, delete items. Single-click condition toggle (good ↔ broken). Soft-delete with audit log.
- 📷 **Photos** — Upload photos per item (stored locally in `data/photos/`). Served via authenticated `/api/photos/...` route.
- 🔲 **QR Labels** — One unique 8-char code per item. `/qr` page renders an A4-printable label grid; scan opens the item.
- 📑 **Reports** — Full inventory Excel export, per-location workbook with separate sheets, condition styling.
- 📥 **Excel Re-import** — Upload a new `.xlsx`, see a 4-bucket diff (new / changed / unchanged / orphans), apply with one click. All changes audited.
- 🔐 **Auth + Roles** — Email + password (iron-session sealed cookie). Roles: admin / staff / viewer.

## Setup

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local      # then edit .env.local with a real SESSION_PASSWORD
pnpm db:migrate                 # apply Drizzle schema to data/kurikara.db
pnpm db:seed                    # parse tests/fixtures/Office_Assets_v2.xlsx and seed everything
pnpm dev                        # open http://localhost:3010
```

Default login:
- **Email:** `admin@kurikaralanka.local`
- **Password:** `admin1234` (change with `SEED_ADMIN_PASSWORD=... pnpm db:seed`)

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start Next dev server on :3010 |
| `pnpm build && pnpm start` | Production build + serve |
| `pnpm test` | Run Vitest suite (parser + normalizer, 10 tests) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Next.js ESLint |
| `pnpm db:generate` | Regenerate migration SQL from `src/lib/db/schema.ts` |
| `pnpm db:migrate` | Apply pending migrations to local SQLite |
| `pnpm db:seed` | Re-import Excel + create admin user |

## Project layout

```
kurikara-assets/
├── data/                       # local-only: kurikara.db + photos/ + imports/
├── drizzle/                    # generated migrations
├── tests/
│   ├── excel/                  # parser + normalizer tests (Vitest)
│   └── fixtures/Office_Assets_v2.xlsx
└── src/
    ├── app/
    │   ├── (app)/              # auth-required routes — share TopNav layout
    │   │   ├── page.tsx        # → floor plan
    │   │   ├── dashboard/
    │   │   ├── items/
    │   │   ├── qr/             # printable label sheet
    │   │   ├── reports/
    │   │   └── logout/
    │   ├── (auth)/login/
    │   ├── api/
    │   │   ├── locations/[id]/items
    │   │   ├── search
    │   │   ├── export/excel
    │   │   └── photos/[...path]
    │   ├── qr/[code]/          # public QR redirect (still auth-gated by middleware)
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── floor-plan/         # view-mode canvas + drawer + stats
    │   ├── designer/           # edit-mode canvas + toolbar + handles
    │   ├── items/              # ItemForm + ItemActionsRow + AddItemButton
    │   ├── search/             # CommandPalette
    │   ├── import/             # ImportWizard
    │   ├── qr/                 # PrintButton
    │   ├── nav/                # TopNav
    │   ├── auth/               # LoginForm
    │   └── ui/                 # shadcn-style primitives
    ├── lib/
    │   ├── db/                 # Drizzle schema + client
    │   ├── actions/            # server actions (items, layout, import, photos)
    │   ├── auth/               # session + login action
    │   ├── queries/            # locations, dashboard, qr, meta
    │   ├── excel/              # parser + normalizer
    │   ├── audit.ts            # audit log helper
    │   ├── qr.ts               # short code generator
    │   ├── health.ts           # condition score → colour
    │   └── utils.ts
    ├── stores/                 # zustand stores
    │   └── designerStore.ts
    ├── middleware.ts           # cookie-gate redirect
    └── types/env.d.ts
```

## Roles

- **admin** — full access, including Floor Designer (layout edits) and deletes.
- **staff** — add / edit items and condition toggles. No deletes. No layout edits.
- **viewer** — read-only.

Promote a user:

```sql
update users set role = 'admin' where email = 'someone@example.com';
```

## Deployment

The app is a standard Next.js application with **two** local-only data dependencies:
- `data/kurikara.db` — SQLite database (WAL mode)
- `data/photos/` — uploaded photos

For a single-host deployment (DigitalOcean / Hetzner / your own server):

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
NODE_ENV=production pnpm start
```

Reverse-proxy port 3010 behind nginx/caddy with HTTPS. Set `NEXT_PUBLIC_SITE_URL` and `SESSION_PASSWORD` in production env.

Back up `data/` regularly (`tar czf backup.tgz data/`).

## Implementation history

Built in 8 phases of full-stack development; see `git log` for per-phase commits.

| Phase | Outcome |
|---|---|
| 1 | Foundation, SQLite, Drizzle, iron-session, login, items table |
| 2 | Read-only floor plan with click-to-drawer + floor switcher |
| 3 | Dashboard + Cmd-K palette |
| 4 | CRUD + audit log |
| 5 | Floor Designer mode (drag/resize/rotate + persist) |
| 6 | Photos + QR labels |
| 7 | Excel export + re-import wizard with diff |
| 8 | Polish + production build |
