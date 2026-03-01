/**
 * Utilities for continuous 2D heatmap: IDW interpolation and hot colormap (red = low, yellow = high).
 */

export interface HeatmapPoint {
  x: number; // 0–100
  y: number; // 0–100
  value: number;
}

const IDW_EPS = 1e-6;

/**
 * Inverse-distance weighting: interpolate value at (px, py) from points.
 * px, py in 0–100; returns interpolated value or NaN if no points.
 */
function idwAt(
  px: number,
  py: number,
  points: HeatmapPoint[],
  power: number,
): number {
  let sumW = 0;
  let sumWv = 0;
  for (const p of points) {
    const dx = (px - p.x) / 100;
    const dy = (py - p.y) / 100;
    const d2 = dx * dx + dy * dy;
    const d = Math.sqrt(d2) || IDW_EPS;
    const w = 1 / Math.pow(d, power);
    sumW += w;
    sumWv += w * p.value;
  }
  return sumW === 0 ? NaN : sumWv / sumW;
}

/**
 * Build a 2D grid of interpolated values using IDW.
 * Grid coordinates (i, j) map to x = (j + 0.5) / gridW * 100, y = (i + 0.5) / gridH * 100.
 */
export function idwInterpolate(
  gridW: number,
  gridH: number,
  points: HeatmapPoint[],
  power: number = 2,
): number[][] {
  const grid: number[][] = [];
  for (let i = 0; i < gridH; i++) {
    const row: number[] = [];
    const py = ((i + 0.5) / gridH) * 100;
    for (let j = 0; j < gridW; j++) {
      const px = ((j + 0.5) / gridW) * 100;
      row.push(idwAt(px, py, points, power));
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Multicolor colormap for heatmap: blue (low) → red (high), matching the top legend bar.
 * value in [minV, maxV].
 */
export function valueToHotColor(
  value: number,
  minV: number,
  maxV: number,
): string {
  const n = Math.max(0, Math.min(1, (value - minV) / (maxV - minV || 1)));

  const stops = [
    { t: 0, r: 0, g: 0, b: 255 }, // blue
    { t: 0.2, r: 0, g: 255, b: 255 }, // cyan
    { t: 0.4, r: 0, g: 255, b: 0 }, // green
    { t: 0.6, r: 255, g: 255, b: 0 }, // yellow
    { t: 0.8, r: 255, g: 127, b: 0 }, // orange
    { t: 1, r: 255, g: 0, b: 0 }, // red
  ];

  let start = stops[0];
  let end = stops[stops.length - 1];

  for (let i = 1; i < stops.length; i++) {
    if (n <= stops[i].t) {
      start = stops[i - 1];
      end = stops[i];
      break;
    }
  }

  const span = end.t - start.t || 1;
  const localT = (n - start.t) / span;

  const r = Math.round(start.r + (end.r - start.r) * localT);
  const g = Math.round(start.g + (end.g - start.g) * localT);
  const b = Math.round(start.b + (end.b - start.b) * localT);

  return `rgb(${r}, ${g}, ${b})`;
}
