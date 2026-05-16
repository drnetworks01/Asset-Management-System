import { FloorPlanCanvas } from '@/components/floor-plan/FloorPlanCanvas';
import {
  getFloorSummaries,
  getLocationsWithStats,
} from '@/lib/queries/locations';

export const dynamic = 'force-dynamic';

export default async function FloorPlanPage() {
  const [floors, locations] = await Promise.all([
    getFloorSummaries(),
    getLocationsWithStats(),
  ]);

  return (
    <FloorPlanCanvas
      floors={floors}
      locations={locations}
      initialLevel={floors[0]?.level ?? 1}
    />
  );
}
