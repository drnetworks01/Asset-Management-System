'use client';

import { useState } from 'react';
import type { LocationWithStats } from '@/lib/queries/locations';
import { healthScore, healthColor, healthStroke } from '@/lib/health';

type RoomProps = {
  location: LocationWithStats;
  onSelect: (location: LocationWithStats) => void;
};

export function Room({ location, onSelect }: RoomProps) {
  const [hover, setHover] = useState(false);
  const {
    shapeData: { x, y, width, height, rotation },
    name,
    totalItems,
    goodCount,
    brokenCount,
    repairCount,
  } = location;

  const score = healthScore(goodCount, brokenCount, repairCount);
  const fill = healthColor(score, hover ? 0.85 : 0.6);
  const stroke = healthStroke(score, 1);

  const cx = x + width / 2;
  const cy = y + height / 2;
  const transform = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined;

  return (
    <g
      transform={transform}
      style={{
        cursor: 'pointer',
        opacity: hover ? 1 : 0.95,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(location)}
    >
      {location.shape === 'circle' ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={width / 2}
          ry={height / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={12}
          ry={12}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
      )}

      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill="rgba(255,255,255,0.95)"
        pointerEvents="none"
      >
        {name.length > 22 ? name.slice(0, 20) + '…' : name}
      </text>

      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill="rgba(255,255,255,0.95)"
        pointerEvents="none"
      >
        {totalItems}
      </text>

      {brokenCount > 0 && (
        <g pointerEvents="none">
          <rect
            x={x + width - 56}
            y={y + 8}
            width={48}
            height={20}
            rx={10}
            fill="rgba(239,68,68,0.95)"
          />
          <text
            x={x + width - 32}
            y={y + 22}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="white"
          >
            ⚠ {brokenCount}
          </text>
        </g>
      )}
    </g>
  );
}
