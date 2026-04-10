'use client';

import { valueToHotColor } from '@/lib/farm-data';

interface HeatmapBackgroundProps {
  grid: number[][];
  scaleMin: number;
  scaleMax: number;
  cols: number;
  rows: number;
}

export function HeatmapBackground({
  grid,
  scaleMin,
  scaleMax,
  cols,
  rows,
}: HeatmapBackgroundProps) {
  return (
    <div
      className="absolute inset-0 grid h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {grid.map((row, i) =>
        row.map((val, j) => (
          <div
            key={`${i}-${j}`}
            className="min-h-0 min-w-0"
            style={{
              backgroundColor: Number.isNaN(val)
                ? 'rgb(240,240,240)'
                : valueToHotColor(val, scaleMin, scaleMax),
            }}
          />
        )),
      )}
    </div>
  );
}
