'use client';

import type { FloorSummary, LocationWithStats } from '@/lib/queries/locations';
import { healthScore, healthLabel } from '@/lib/health';

type Props = {
  floor: FloorSummary;
  locations: LocationWithStats[];
  onLocationSelect: (location: LocationWithStats) => void;
};

export function FloorStatsPanel({ floor, locations, onLocationSelect }: Props) {
  const healthPct =
    floor.totalItems === 0
      ? 100
      : Math.round((floor.goodCount / floor.totalItems) * 100);

  const topBroken = [...locations]
    .filter((l) => l.brokenCount > 0)
    .sort((a, b) => b.brokenCount - a.brokenCount)
    .slice(0, 5);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Floor Overview
        </p>
        <h2 className="mt-1 text-2xl font-bold">{floor.name}</h2>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {floor.totalItems}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-success">Good</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">
            {floor.goodCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs text-danger">Broken</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-danger">
            {floor.brokenCount}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between text-xs">
          <span className="uppercase tracking-wider text-muted-foreground">
            Health
          </span>
          <span className="font-medium">{healthPct}% good</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-success via-accent to-danger"
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Locations ({floor.locationCount})
        </h3>
        <ul className="space-y-1">
          {locations.map((loc) => {
            const score = healthScore(
              loc.goodCount,
              loc.brokenCount,
              loc.repairCount,
            );
            const label = healthLabel(score);
            return (
              <li key={loc.id}>
                <button
                  onClick={() => onLocationSelect(loc)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        label === 'critical'
                          ? 'h-2 w-2 rounded-full bg-danger'
                          : label === 'attention'
                            ? 'h-2 w-2 rounded-full bg-accent'
                            : 'h-2 w-2 rounded-full bg-success'
                      }
                    />
                    <span className="truncate">{loc.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {loc.totalItems}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {topBroken.length > 0 && (
        <section className="rounded-lg border border-danger/40 bg-danger/5 p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wider text-danger">
            Needs Attention
          </h3>
          <ul className="space-y-1 text-sm">
            {topBroken.map((loc) => (
              <li key={loc.id} className="flex justify-between">
                <span className="truncate">{loc.name}</span>
                <span className="font-bold text-danger">⚠ {loc.brokenCount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
