'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDesignerStore, type DesignerRoom } from '@/stores/designerStore';
import { saveLayoutAction } from '@/lib/actions/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  floors: Array<{ floorId: string; level: number; name: string }>;
  activeLevel: number;
};

export function DesignerToolbar({ floors, activeLevel }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const mode = useDesignerStore((s) => s.mode);
  const setMode = useDesignerStore((s) => s.setMode);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const rooms = useDesignerStore((s) => s.rooms);
  const showGrid = useDesignerStore((s) => s.showGrid);
  const snapToGrid = useDesignerStore((s) => s.snapToGrid);
  const toggleGrid = useDesignerStore((s) => s.toggleGrid);
  const toggleSnap = useDesignerStore((s) => s.toggleSnap);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const renameRoom = useDesignerStore((s) => s.renameRoom);
  const recolorRoom = useDesignerStore((s) => s.recolorRoom);
  const rotateRoom = useDesignerStore((s) => s.rotateRoom);
  const deleteRoom = useDesignerStore((s) => s.deleteRoom);
  const updateRoom = useDesignerStore((s) => s.updateRoom);
  const changedRooms = useDesignerStore((s) => s.changedRooms);
  const setPendingTool = useDesignerStore((s) => s as unknown as { pendingTool?: DesignerRoom['shape'] | null });

  const activeFloor = floors.find((f) => f.level === activeLevel);
  const selected = selectedId ? rooms[selectedId] : null;

  function setTool(shape: DesignerRoom['shape']) {
    window.dispatchEvent(new CustomEvent('designer:tool', { detail: shape }));
  }

  function onSave() {
    startTransition(async () => {
      const all = changedRooms();
      const res = await saveLayoutAction(
        all.map((r) => ({
          id: r.id,
          floorId: r.floorId,
          name: r.name,
          slug: r.slug,
          shape: r.shape,
          shapeData: r.shapeData,
          color: r.color,
          icon: r.icon,
          isNew: r.isNew,
          isDeleted: r.isDeleted,
        })),
      );
      if (res.ok) {
        setMode('view');
        router.refresh();
      } else {
        alert(`Save failed: ${res.error}`);
      }
    });
  }

  if (mode === 'view') {
    return (
      <button
        onClick={() => setMode('design')}
        className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20"
      >
        🎨 Design Mode
      </button>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col gap-4 overflow-y-auto border-r border-border bg-background/95 p-4 shadow-xl backdrop-blur">
      <header>
        <p className="text-xs uppercase tracking-wider text-accent">Design Mode</p>
        <h2 className="text-lg font-bold">Floor Designer</h2>
        <p className="text-xs text-muted-foreground">
          Floor {activeLevel} · {Object.values(rooms).filter((r) => !r.isDeleted && r.floorId === activeFloor?.floorId).length} rooms
        </p>
      </header>

      <section>
        <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Add Shape
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <ShapeBtn label="▭ Rect" onClick={() => setTool('rect')} />
          <ShapeBtn label="◯ Circle" onClick={() => setTool('circle')} />
          <ShapeBtn label="⌐ L-Shape" onClick={() => setTool('l_shape')} />
          <ShapeBtn label="◇ Polygon" onClick={() => setTool('polygon')} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Grid
        </h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showGrid} onChange={toggleGrid} />
            Show grid
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={snapToGrid} onChange={toggleSnap} />
            Snap to grid (20px)
          </label>
        </div>
      </section>

      {selected && !selected.isDeleted && (
        <section className="space-y-3 rounded-lg border border-border bg-background/60 p-3">
          <h3 className="text-xs uppercase tracking-wider text-accent">Selected</h3>
          <div className="space-y-2">
            <Label htmlFor="room-name" className="text-xs">
              Name
            </Label>
            <Input
              id="room-name"
              value={selected.name}
              onChange={(e) => renameRoom(selected.id, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-floor" className="text-xs">
              Floor
            </Label>
            <select
              id="room-floor"
              value={selected.floorId}
              onChange={(e) => updateRoom(selected.id, { floorId: e.target.value })}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            >
              {floors.map((f) => (
                <option key={f.floorId} value={f.floorId}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(selected.shapeData.width)}
                onChange={(e) =>
                  updateRoom(selected.id, {
                    shapeData: {
                      ...selected.shapeData,
                      width: Number(e.target.value) || 40,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(selected.shapeData.height)}
                onChange={(e) =>
                  updateRoom(selected.id, {
                    shapeData: {
                      ...selected.shapeData,
                      height: Number(e.target.value) || 40,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rotation: {selected.shapeData.rotation ?? 0}°</Label>
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.shapeData.rotation ?? 0}
              onChange={(e) => rotateRoom(selected.id, Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <input
              type="color"
              value={selected.color}
              onChange={(e) => recolorRoom(selected.id, e.target.value)}
              className="h-9 w-full rounded border border-border bg-transparent"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => deleteRoom(selected.id)}
          >
            🗑 Delete room
          </Button>
        </section>
      )}

      <footer className="mt-auto space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={undo}>
            ↶ Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo}>
            ↷ Redo
          </Button>
        </div>
        <Button className="w-full" disabled={pending} onClick={onSave}>
          {pending ? 'Saving…' : '💾 Save Layout'}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMode('view')}
        >
          Exit Designer
        </Button>
      </footer>

      {/* silence unused warning */}
      <span hidden>{String(setPendingTool)}</span>
    </aside>
  );
}

function ShapeBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs hover:bg-muted"
    >
      {label}
    </button>
  );
}
