'use client';

import { useMemo, useState } from 'react';
import type { LocationWithStats, FloorSummary } from '@/lib/queries/locations';
import { Room } from './Room';
import { FloorSwitcher } from './FloorSwitcher';
import { FloorStatsPanel } from './FloorStatsPanel';
import { LocationDrawer } from './LocationDrawer';

type FloorPlanCanvasProps = {
  floors: FloorSummary[];
  locations: LocationWithStats[];
  initialLevel?: number;
};

const PADDING = 40;
const MIN_W = 1200;
const MIN_H = 800;

export function FloorPlanCanvas({
  floors,
  locations,
  initialLevel,
}: FloorPlanCanvasProps) {
  const defaultLevel =
    initialLevel ?? floors[0]?.level ?? 1;
  const [activeLevel, setActiveLevel] = useState(defaultLevel);
  const [selected, setSelected] = useState<LocationWithStats | null>(null);

  const visibleLocations = useMemo(
    () => locations.filter((l) => l.floorLevel === activeLevel),
    [locations, activeLevel],
  );

  const viewBox = useMemo(() => {
    if (visibleLocations.length === 0) {
      return `0 0 ${MIN_W} ${MIN_H}`;
    }
    let maxX = MIN_W;
    let maxY = MIN_H;
    for (const loc of visibleLocations) {
      const { x, y, width, height } = loc.shapeData;
      maxX = Math.max(maxX, x + width + PADDING);
      maxY = Math.max(maxY, y + height + PADDING);
    }
    return `0 0 ${maxX} ${maxY}`;
  }, [visibleLocations]);

  const activeFloor = floors.find((f) => f.level === activeLevel);

  return (
    <div className="relative flex h-[calc(100vh-72px)] w-full overflow-hidden">
      {/* Canvas */}
      <div className="relative flex-1 overflow-auto">
        <div className="sticky left-1/2 top-4 z-10 mx-auto -ml-[150px] inline-flex w-[300px] justify-center">
          <FloorSwitcher
            floors={floors}
            activeLevel={activeLevel}
            onChange={setActiveLevel}
          />
        </div>

        <svg
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-full min-h-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {visibleLocations.map((loc) => (
            <Room key={loc.id} location={loc} onSelect={setSelected} />
          ))}
        </svg>

        {visibleLocations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-dashed border-border bg-background/60 px-8 py-6 text-center backdrop-blur">
              <p className="text-lg font-semibold">No rooms on this floor</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add rooms via the Designer (coming in Phase 5).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats panel */}
      <aside className="hidden w-[320px] flex-shrink-0 border-l border-border bg-background/40 backdrop-blur lg:block">
        {activeFloor && (
          <FloorStatsPanel
            floor={activeFloor}
            locations={visibleLocations}
            onLocationSelect={setSelected}
          />
        )}
      </aside>

      {/* Drawer */}
      <LocationDrawer
        open={selected !== null}
        location={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
