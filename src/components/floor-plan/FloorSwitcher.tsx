'use client';

import { cn } from '@/lib/utils';
import type { FloorSummary } from '@/lib/queries/locations';

type FloorSwitcherProps = {
  floors: FloorSummary[];
  activeLevel: number;
  onChange: (level: number) => void;
};

export function FloorSwitcher({ floors, activeLevel, onChange }: FloorSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 backdrop-blur">
      {floors.map((floor) => {
        const active = floor.level === activeLevel;
        return (
          <button
            key={floor.floorId}
            type="button"
            onClick={() => onChange(floor.level)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{floor.name}</span>
            <span className="ml-2 text-xs opacity-70 tabular-nums">
              {floor.totalItems}
            </span>
          </button>
        );
      })}
    </div>
  );
}
