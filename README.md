# Kurikara Assets

Office inventory management for the Kurikaralanka campus.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase keys.
2. `pnpm install`
3. Run Supabase migrations: see `supabase/migrations/`.
4. Generate seed from Excel: `pnpm seed:from-excel`.
5. Apply `supabase/seed.sql` to your Supabase project.
6. `pnpm dev` → opens at <http://localhost:3010>.

## Stack

Next.js 15 · TypeScript · Tailwind · Supabase · shadcn/ui · Framer Motion
