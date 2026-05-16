import Link from 'next/link';
import { getDashboard } from '@/lib/queries/dashboard';
import {
  getAlerts,
  getActivityFeed,
  getTotalValue,
} from '@/lib/queries/alerts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [d, alerts, activity, valueStats] = await Promise.all([
    getDashboard(),
    getAlerts(),
    getActivityFeed(15),
    getTotalValue(),
  ]);

  const goodPct = d.totalItems === 0 ? 0 : Math.round((d.goodCount / d.totalItems) * 100);
  const maxCatCount = Math.max(...d.byCategory.map((c) => c.count), 1);
  const maxLocCount = Math.max(...d.byLocation.map((l) => l.count), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Inventory overview at a glance.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{goodPct}% in good condition</p>
      </header>

      {alerts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            🔔 Alerts ({alerts.length})
          </h2>
          <ul className="space-y-2">
            {alerts.map((a, i) => {
              const tone =
                a.severity === 'critical'
                  ? 'border-danger/40 bg-danger/5 text-danger'
                  : a.severity === 'warning'
                    ? 'border-accent/40 bg-accent/5 text-accent'
                    : 'border-border bg-background/60';
              return (
                <li key={i} className={`rounded-lg border p-3 text-sm ${tone}`}>
                  <p className="font-medium">{a.message}</p>
                  {a.detail && <p className="text-xs opacity-80">{a.detail}</p>}
                  {a.href && (
                    <Link href={a.href} className="mt-1 inline-block text-xs underline">
                      View →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Items" value={d.totalItems} accent="primary" />
        <StatCard label="Good" value={d.goodCount} accent="success" />
        <StatCard label="Broken" value={d.brokenCount} accent="danger" />
        <StatCard label="Locations" value={d.locationCount} accent="muted" />
        <StatCard
          label="Value (LKR)"
          value={valueStats.totalValue}
          accent="primary"
          format="currency"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-background/60 p-6 md:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Condition Breakdown
          </h2>
          <ConditionDonut good={d.goodCount} broken={d.brokenCount} repair={d.repairCount} />
          <ul className="mt-4 space-y-1 text-sm">
            <LegendRow color="bg-success" label="Good" value={d.goodCount} />
            <LegendRow color="bg-danger" label="Broken" value={d.brokenCount} />
            {d.repairCount > 0 && <LegendRow color="bg-accent" label="Repair" value={d.repairCount} />}
          </ul>
          {valueStats.itemsWithoutValue > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {valueStats.itemsWithoutValue} items have no value set
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-6 md:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Items per Location
          </h2>
          <ul className="space-y-2">
            {d.byLocation.slice(0, 10).map((l) => {
              const widthPct = (l.count / maxLocCount) * 100;
              return (
                <li key={l.slug} className="space-y-1">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {l.count}
                      {l.broken > 0 && (
                        <span className="ml-2 text-danger">⚠ {l.broken}</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${widthPct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-background/60 p-6 md:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h2>
          <ul className="space-y-2">
            {d.byCategory.slice(0, 10).map((c) => (
              <li key={c.name} className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground tabular-nums">
                  <span
                    className="inline-block h-2 rounded-full bg-accent"
                    style={{ width: `${(c.count / maxCatCount) * 120 + 4}px` }}
                  />
                  {c.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 md:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-danger">
            ⚠ Needs Attention
          </h2>
          {d.topBroken.length === 0 ? (
            <p className="text-sm text-muted-foreground">No broken items right now.</p>
          ) : (
            <ul className="space-y-2">
              {d.topBroken.map((b) => (
                <li
                  key={b.id}
                  className="flex items-baseline justify-between border-b border-danger/20 pb-2 text-sm last:border-0"
                >
                  <div>
                    <Link
                      href={`/items/${b.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {b.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {b.locationName ?? 'No location'}
                    </p>
                  </div>
                  <span className="font-bold text-danger tabular-nums">× {b.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-6 md:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
          <ul className="space-y-2 text-sm">
            {activity.map((a) => (
              <li
                key={a.id}
                className="border-b border-border/40 pb-2 last:border-0"
              >
                <p>{a.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {a.userEmail ?? 'system'} ·{' '}
                  <time>{new Date(a.createdAt).toLocaleString()}</time>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  format,
}: {
  label: string;
  value: number;
  accent: 'primary' | 'success' | 'danger' | 'muted';
  format?: 'currency';
}) {
  const tone =
    accent === 'success'
      ? 'border-success/30 bg-success/5'
      : accent === 'danger'
        ? 'border-danger/30 bg-danger/5'
        : accent === 'primary'
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-background/60';
  const text =
    accent === 'success'
      ? 'text-success'
      : accent === 'danger'
        ? 'text-danger'
        : accent === 'primary'
          ? 'text-primary'
          : 'text-foreground';
  const display =
    format === 'currency'
      ? `LKR ${value.toLocaleString()}`
      : value.toLocaleString();
  return (
    <div className={`rounded-xl border p-5 ${tone}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${text}`}>{display}</p>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
        <span>{label}</span>
      </span>
      <span className="text-muted-foreground tabular-nums">{value}</span>
    </li>
  );
}

function ConditionDonut({ good, broken, repair }: { good: number; broken: number; repair: number }) {
  const total = good + broken + repair;
  if (total === 0) return null;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const goodLen = (good / total) * circumference;
  const brokenLen = (broken / total) * circumference;
  const repairLen = (repair / total) * circumference;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="14" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#10B981" strokeWidth="14" strokeDasharray={`${goodLen} ${circumference}`} />
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#EF4444" strokeWidth="14" strokeDasharray={`${brokenLen} ${circumference}`} strokeDashoffset={-goodLen} />
        {repair > 0 && (
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F59E0B" strokeWidth="14" strokeDasharray={`${repairLen} ${circumference}`} strokeDashoffset={-(goodLen + brokenLen)} />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">items</span>
      </div>
    </div>
  );
}
