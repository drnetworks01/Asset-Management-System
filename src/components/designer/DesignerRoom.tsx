'use client';

import { useRef } from 'react';
import { useDesignerStore } from '@/stores/designerStore';
import type { DesignerRoom as Room } from '@/stores/designerStore';

type Props = {
  room: Room;
  svgRef: React.RefObject<SVGSVGElement | null>;
};

type DragKind =
  | { kind: 'move'; startX: number; startY: number }
  | { kind: 'resize'; handle: ResizeHandle; startRect: { x: number; y: number; width: number; height: number } };

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

export function DesignerRoom({ room, svgRef }: Props) {
  const select = useDesignerStore((s) => s.select);
  const moveRoom = useDesignerStore((s) => s.moveRoom);
  const resizeRoom = useDesignerStore((s) => s.resizeRoom);
  const selected = useDesignerStore((s) => s.selectedId === room.id);

  const dragRef = useRef<DragKind | null>(null);
  const accumRef = useRef({ dx: 0, dy: 0 });

  const { x, y, width, height, rotation } = room.shapeData;
  const cx = x + width / 2;
  const cy = y + height / 2;

  function svgPoint(e: React.PointerEvent | PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const sx = viewBox.width / rect.width;
    const sy = viewBox.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  }

  function onPointerDownBody(e: React.PointerEvent) {
    if (room.isDeleted) return;
    e.stopPropagation();
    select(room.id);
    const p = svgPoint(e);
    dragRef.current = { kind: 'move', startX: p.x, startY: p.y };
    accumRef.current = { dx: 0, dy: 0 };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerDownHandle(handle: ResizeHandle) {
    return (e: React.PointerEvent) => {
      if (room.isDeleted) return;
      e.stopPropagation();
      select(room.id);
      dragRef.current = {
        kind: 'resize',
        handle,
        startRect: { x, y, width, height },
      };
      (e.target as Element).setPointerCapture(e.pointerId);
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const p = svgPoint(e);
    if (drag.kind === 'move') {
      const newDx = p.x - drag.startX;
      const newDy = p.y - drag.startY;
      const dx = newDx - accumRef.current.dx;
      const dy = newDy - accumRef.current.dy;
      accumRef.current = { dx: newDx, dy: newDy };
      moveRoom(room.id, dx, dy);
    } else {
      const { startRect, handle } = drag;
      let nx = startRect.x;
      let ny = startRect.y;
      let nw = startRect.width;
      let nh = startRect.height;
      const right = startRect.x + startRect.width;
      const bottom = startRect.y + startRect.height;

      if (handle.includes('w')) {
        nx = Math.min(p.x, right - 40);
        nw = right - nx;
      } else if (handle.includes('e')) {
        nw = Math.max(40, p.x - startRect.x);
      }
      if (handle.includes('n')) {
        ny = Math.min(p.y, bottom - 40);
        nh = bottom - ny;
      } else if (handle.includes('s')) {
        nh = Math.max(40, p.y - startRect.y);
      }
      resizeRoom(room.id, { x: nx, y: ny, width: nw, height: nh });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    accumRef.current = { dx: 0, dy: 0 };
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  if (room.isDeleted) return null;

  const handles: Array<{ key: ResizeHandle; cx: number; cy: number; cursor: string }> = [
    { key: 'nw', cx: x, cy: y, cursor: 'nwse-resize' },
    { key: 'ne', cx: x + width, cy: y, cursor: 'nesw-resize' },
    { key: 'sw', cx: x, cy: y + height, cursor: 'nesw-resize' },
    { key: 'se', cx: x + width, cy: y + height, cursor: 'nwse-resize' },
    { key: 'n', cx: x + width / 2, cy: y, cursor: 'ns-resize' },
    { key: 's', cx: x + width / 2, cy: y + height, cursor: 'ns-resize' },
    { key: 'w', cx: x, cy: y + height / 2, cursor: 'ew-resize' },
    { key: 'e', cx: x + width, cy: y + height / 2, cursor: 'ew-resize' },
  ];

  return (
    <g
      transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {room.shape === 'circle' ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={width / 2}
          ry={height / 2}
          fill={`${room.color}66`}
          stroke={selected ? '#F59E0B' : room.color}
          strokeWidth={selected ? 3 : 2}
          style={{ cursor: 'move' }}
          onPointerDown={onPointerDownBody}
        />
      ) : room.shapeData.points && room.shapeData.points.length >= 3 ? (
        <polygon
          points={room.shapeData.points
            .map((p) => `${x + p.x},${y + p.y}`)
            .join(' ')}
          fill={`${room.color}66`}
          stroke={selected ? '#F59E0B' : room.color}
          strokeWidth={selected ? 3 : 2}
          strokeLinejoin="round"
          style={{ cursor: 'move' }}
          onPointerDown={onPointerDownBody}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={12}
          ry={12}
          fill={`${room.color}66`}
          stroke={selected ? '#F59E0B' : room.color}
          strokeWidth={selected ? 3 : 2}
          style={{ cursor: 'move' }}
          onPointerDown={onPointerDownBody}
        />
      )}

      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight={600}
        fill="white"
        pointerEvents="none"
      >
        {room.name}
      </text>

      {selected &&
        handles.map((h) => (
          <rect
            key={h.key}
            x={h.cx - 6}
            y={h.cy - 6}
            width={12}
            height={12}
            rx={2}
            fill="#F59E0B"
            stroke="white"
            strokeWidth={1.5}
            style={{ cursor: h.cursor }}
            onPointerDown={onPointerDownHandle(h.key)}
          />
        ))}
    </g>
  );
}
