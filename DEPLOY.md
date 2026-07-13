# Deploy to Fly.io

Step-by-step guide for deploying Kurikara Assets to Fly.io (Singapore region, with persistent SQLite volume).

---

## 0. Prerequisites — fix the `fly: command not found` issue first

The `flyctl install` you ran installed the binary to:

```
C:\Users\Dumindu\.fly\bin\flyctl.exe
```

It also added that folder to your **persisted** Windows user PATH. But the PowerShell session you ran the installer in still has the **old** PATH — that's why `fly launch` failed.

### Fix in 2 steps

1. **Close the current PowerShell window completely** and open a **fresh** PowerShell window. The new shell will read the updated PATH at startup.
2. In the fresh window, use `flyctl` (the actual binary name), not `fly`:
   ```powershell
   flyctl version
   ```
   If you see a version string, you're good. If not, run with the full path once:
   ```powershell
   & "$env:USERPROFILE\.fly\bin\flyctl.exe" version
   ```

> Why this matters: `fly` is just an alias for `flyctl` that some installers create. The official binary is always `flyctl`. Using the full name avoids surprises.

---

## 1. Log in to Fly.io

```powershell
flyctl auth login
```

This opens your browser. Sign up if you don't have an account (free tier is fine for this app — 3 shared-cpu-1x VMs + 3 GB volume storage are free).

---

## 2. Create the app (one-time)

From the project folder:

```powershell
cd "C:\Users\Dumindu\Documents\KH-ERP\all in one\kurikara-assets"
flyctl apps create kurikara-assets --org personal
```

> If `kurikara-assets` is taken globally, pick another name (e.g. `kh-kurikara-assets`) and update `app = "..."` in `fly.toml`.

---

## 3. Create the persistent volume (one-time)

The app stores SQLite + uploaded photos in `/app/data`. Without a volume, every redeploy wipes the data.

```powershell
flyctl volumes create kurikara_data --region sin --size 1 --app kurikara-assets
```

- `--size 1` = 1 GB (free tier allows up to 3 GB total across volumes; 1 GB is plenty for a few thousand items + photos).
- The volume name `kurikara_data` must match `[mounts].source` in `fly.toml`.

---

## 4. Set secrets (one-time, but you can rotate any time)

All five secrets MUST be set before the first deploy or the seed step will fail:

```powershell
# 32+ char random string — used by iron-session to encrypt cookies.
# Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
flyctl secrets set SESSION_PASSWORD="<paste-64-hex-chars-here>" --app kurikara-assets

# Your OpenRouter API key for AI search + photo categorize.
flyctl secrets set OPENROUTER_API_KEY="<your-key-here>" --app kurikara-assets

# Public URL of the deployed app. Used by AI client for OpenRouter analytics
# and by photo-link / QR-code generation.
flyctl secrets set NEXT_PUBLIC_SITE_URL="https://kurikara-assets.fly.dev" --app kurikara-assets

# Seed admin credentials (used ONLY on first boot of an empty database).
# The seed script requires a unique password with at least 12 characters.
flyctl secrets set SEED_ADMIN_EMAIL="admin@kurikaralanka.local" --app kurikara-assets
flyctl secrets set SEED_ADMIN_PASSWORD="<a-strong-24-char-password>" --app kurikara-assets
```

> **Use the password you just rotated locally** (the one printed by `rotate-admin-password.ts`), OR generate a different one for production. Either is fine — they don't need to match.

Verify:

```powershell
flyctl secrets list --app kurikara-assets
```

---

## 5. Deploy

```powershell
flyctl deploy --app kurikara-assets
```

What happens:
1. Fly builds your `Dockerfile` (multi-stage Alpine + native better-sqlite3 compile).
2. Fly mounts the `kurikara_data` volume at `/app/data`.
3. `docker-entrypoint.sh` runs Drizzle migrations.
4. If the database is empty, it runs `seed-db.ts` (creates admin user + seeds the 174 items from `Office_Assets_v2.xlsx`).
5. The Next.js server starts on port 3010 and is routed through Fly's edge to `https://kurikara-assets.fly.dev`.

First deploy takes ~4–7 minutes (most of it is `pnpm install` + better-sqlite3 compile). Subsequent deploys take ~1–2 minutes.

---

## 6. Verify

```powershell
flyctl status --app kurikara-assets
flyctl logs --app kurikara-assets
```

Open `https://kurikara-assets.fly.dev/login` and sign in with `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`.

---

## Rotating the admin password later

```powershell
# Locally — for the local dev database
pnpm tsx scripts/rotate-admin-password.ts

# In production — SSH into the running VM
flyctl ssh console --app kurikara-assets
# inside the VM:
pnpm tsx scripts/rotate-admin-password.ts
```

The script reads `DATABASE_FILE` from env (set by the Dockerfile to `/app/data/kurikara.db`), so it works the same in both environments.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `fly: command not found` | Use `flyctl`, not `fly`. Open a fresh PowerShell window. |
| `flyctl: command not found` even in fresh shell | Run `& "$env:USERPROFILE\.fly\bin\flyctl.exe" version`. If that works, PATH wasn't persisted — re-run `iwr https://fly.io/install.ps1 -useb \| iex`. |
| First deploy fails at seed step | Check `flyctl secrets list` — all required secrets must be set. `SEED_ADMIN_PASSWORD` must be unique and at least 12 characters. |
| App is slow / cold-starts | `fly.toml` has `auto_stop_machines = "stop"` — the VM stops when idle (saves money on paid tier; free tier doesn't matter). To keep it always on, change to `auto_stop_machines = "off"`. |
| Out of disk space | `flyctl volumes extend <vol-id> --size 3 --app kurikara-assets` |
| Need to wipe the database | `flyctl ssh console --app kurikara-assets`, then `rm /app/data/kurikara.db*` and restart the machine. Next boot re-seeds. |
| Need to download the database backup | `flyctl ssh sftp shell --app kurikara-assets`, then `get /app/data/kurikara.db ./kurikara-backup.db` |

---

## Cost estimate (free tier)

| Resource | Used | Free tier limit | Cost |
|---|---|---|---|
| shared-cpu-1x@512MB VM | 1 | 3 (always-on equivalent) | $0 |
| Persistent volume | 1 GB | 3 GB | $0 |
| Outbound bandwidth | ~1 GB/mo | 160 GB/mo | $0 |

Effectively free for internal-team use. Becomes paid (~$2–3/mo) only if you scale to a larger VM or add more bandwidth.
