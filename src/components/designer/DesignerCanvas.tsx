'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDesignerStore, type DesignerRoom as Room } from '@/stores/designerStore';
import { DesignerRoom } from './DesignerRoom';

type Props = {
  activeFloorId: string;
};

export function DesignerCanvas({ activeFloorId }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pendingTool, setPendingTool] = useState<Room['shape'] | null>(null);

  const rooms = useDesignerStore((s) => s.rooms);
  const showGrid = useDesignerStore((s) => s.showGrid);
  const addRoom = useDesignerStore((s) => s.addRoom);
  const select = useDesignerStore((s) => s.select);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const deleteRoom = useDesignerStore((s) => s.deleteRoom);

  // Listen to toolbar tool events
  useEffect(() => {
    const handler = (e: Event) => {
      setPendingTool((e as CustomEvent<Room['shape']>).detail);
    };
    window.addEventListener('designer:tool', handler);
    return () => window.removeEventListener('designer:tool', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          redo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          deleteRoom(selectedId);
        }
      }
      if (e.key === 'Escape') {
        setPendingTool(null);
        select(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedId, deleteRoom, select]);

  const visible = useMemo(
    () =>
      Object.values(rooms).filter(
        (r) => !r.isDeleted && r.floorId === activeFloorId,
      ),
    [rooms, activeFloorId],
  );

  const viewBox = useMemo(() => {
    let maxX = 1200;
    let maxY = 800;
    for (const r of visible) {
      maxX = Math.max(maxX, r.shapeData.x + r.shapeData.width + 80);
      maxY = Math.max(maxY, r.shapeData.y + r.shapeData.height + 80);
    }
    return `0 0 ${maxX} ${maxY}`;
  }, [visible]);

  function svgPointFromClient(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return {
      x: ((e.clientX - rect.left) / rect.width) * vb.width,
      y: ((e.clientY - rect.top) / rect.height) * vb.height,
    };
  }

  function onCanvasClick(e: React.MouseEvent) {
    if (pendingTool) {
      const p = svgPointFromClient(e);
      addRoom(pendingTool, activeFloorId, p);
      setPendingTool(null);
    } else {
      // Click empty canvas → deselect
      if (e.target === svgRef.current) select(null);
    }
  }

  return (
    <div className="relative h-[calc(100vh-72px)] w-full overflow-auto pl-72">
      {pendingTool && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg">
          Click anywhere to place {pendingTool} · Press Esc to cancel
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onClick={onCanvasClick}
        style={{ cursor: pendingTool ? 'crosshair' : 'default' }}
      >
        {showGrid && (
          <>
            <defs>
              <pattern
                id="designer-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              </pattern>
              <pattern
                id="designer-grid-major"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#designer-grid)" />
            <rect width="100%" height="100%" fill="url(#designer-grid-major)" />
          </>
        )}
        {visible.map((r) => (
          <DesignerRoom key={r.id} room={r} svgRef={svgRef} />
        ))}
      </svg>
    </div>
  );
}
