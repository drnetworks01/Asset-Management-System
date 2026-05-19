# =====================================================================
# Kurikara Assets — production Dockerfile (Fly.io / any container host)
# Multi-stage build: small runtime image (~250 MB) with a compiled
# better-sqlite3 binding.
# =====================================================================

# ----- Stage 1: deps --------------------------------------------------
# Install all dependencies (incl. native build tools) so better-sqlite3
# can compile against the runtime Node version.
FROM node:20-alpine AS deps
WORKDIR /app

# Native build deps for better-sqlite3 + sharp + bcryptjs (just in case).
RUN apk add --no-cache python3 make g++ libc6-compat

# Enable corepack and pin pnpm explicitly. Without this, corepack auto-fetches
# the latest pnpm (currently 11.x), which has Node 20 incompatibilities
# (ERR_UNKNOWN_BUILTIN_MODULE). 10.33.2 matches the local dev environment.
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Copy lockfiles only — keeps this layer cached when source code changes.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ----- Stage 2: builder -----------------------------------------------
# Build the Next.js standalone bundle.
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate drizzle migrations + build Next.js
RUN pnpm exec drizzle-kit generate || echo "drizzle-kit generate (idempotent skip ok)"
RUN pnpm build

# ----- Stage 3: runner ------------------------------------------------
# Minimal runtime image. Only the standalone server + static assets +
# the compiled better-sqlite3 binding are copied.
FROM node:20-alpine AS runner
WORKDIR /app

# Tini reaps zombie processes — good citizen for Node in containers.
RUN apk add --no-cache tini

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME=0.0.0.0

# Non-root user (Fly.io runs as root by default; this is defence in depth).
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy standalone output (server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy migrations + tests fixtures (needed for first-boot db:migrate + db:seed).
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/tests/fixtures ./tests/fixtures
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# seed-db.ts imports from ../src/lib/excel/parser etc. — needed by tsx at runtime.
# tsconfig is needed by tsx to resolve the @/ path alias.
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Drizzle migrator + seed scripts depend on these; the standalone output
# only includes runtime deps, so we ship them explicitly. They're tiny.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/exceljs ./node_modules/exceljs

# tsx + drizzle-kit need their transitive deps (esbuild, get-tsconfig, etc.)
# which pnpm doesn't hoist to the root node_modules. Installing globally
# in the runner stage gives us a clean, complete copy with proper sibling
# packages — much smaller than copying pnpm's entire .pnpm store.
RUN npm install -g tsx@4.22.0 drizzle-kit@latest --omit=optional 2>&1 | tail -3

# Persistent volume mount target. Fly.io will mount the volume here.
RUN mkdir -p /app/data/photos /app/data/imports && chown -R nextjs:nodejs /app/data
VOLUME ["/app/data"]

# Entrypoint: run migrations, then start the server.
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3010

ENTRYPOINT ["/sbin/tini", "--", "./docker-entrypoint.sh"]
CMD ["node", "server.js"]
