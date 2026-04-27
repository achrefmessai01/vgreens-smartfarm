/**
 * Compute fallback x/y positions for sensors that don't have a saved override.
 *
 * Strategy:
 *   - Group sensors by their greenhouse identifier (override OR InfluxDB tag).
 *   - Within each greenhouse, sort devices alphanumerically (Air_01, Air_02, …)
 *     for a stable, predictable layout.
 *   - Distribute one device per bay along the X axis. If devices > bays, wrap
 *     into multiple rows along Y. Each device sits in the centre of its cell.
 *   - Resolved against the configured greenhouse layout (xDimension × yDimension,
 *     bayCount). Falls back to a synthetic 100×100 layout when nothing is
 *     configured so views still render.
 *
 * Saved overrides always win — these defaults are only consulted when the
 * sensor_configs table has no value for a device.
 */

export interface GreenhouseLayout {
  name: string;
  xDimension: number;
  yDimension: number;
  bayCount?: number | null;
}

export interface DefaultPosition {
  xPosition: number;
  yPosition: number;
}

const FALLBACK_DIMENSION = 100;

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Resolve a greenhouse identifier (e.g. "greenhouse_01" or "Strawberry Hall")
 * to one of the tenant's configured layouts. Mirrors the backend's logic in
 * sensor-config.resolver: exact-name match, then trailing-index regex
 * fallback (greenhouse_NN → layouts[NN-1]). Falls back to the first layout if
 * nothing else matches so unknown identifiers still get a sensible position.
 */
export function resolveGreenhouseLayout(
  identifier: string | undefined | null,
  layouts: GreenhouseLayout[],
): GreenhouseLayout | null {
  if (layouts.length === 0) return null;
  if (!identifier) return layouts[0];
  const trimmed = identifier.trim();
  const exact = layouts.find((l) => l.name === trimmed);
  if (exact) return exact;
  const match = trimmed.match(/(?:greenhouse|chamber)\D*(\d+)$/i);
  if (match) {
    const idx = Number.parseInt(match[1], 10) - 1;
    if (idx >= 0 && idx < layouts.length) return layouts[idx];
  }
  return layouts[0];
}

export function computeDefaultSensorPositions(
  deviceGreenhouse: Map<string, string | undefined | null>,
  layouts: GreenhouseLayout[],
): Map<string, DefaultPosition> {
  const out = new Map<string, DefaultPosition>();
  if (deviceGreenhouse.size === 0) return out;

  const fallbackLayout: GreenhouseLayout = layouts[0] ?? {
    name: 'fallback',
    xDimension: FALLBACK_DIMENSION,
    yDimension: FALLBACK_DIMENSION,
    bayCount: null,
  };

  // Group devices by their resolved layout (use the layout object as the key).
  const groups = new Map<GreenhouseLayout, string[]>();
  for (const [device, identifier] of deviceGreenhouse.entries()) {
    const layout =
      resolveGreenhouseLayout(identifier, layouts) ?? fallbackLayout;
    const list = groups.get(layout) ?? [];
    list.push(device);
    groups.set(layout, list);
  }

  for (const [layout, devices] of groups.entries()) {
    devices.sort(naturalSort);
    const xDim = layout.xDimension > 0 ? layout.xDimension : FALLBACK_DIMENSION;
    const yDim = layout.yDimension > 0 ? layout.yDimension : FALLBACK_DIMENSION;
    const cols = Math.max(1, layout.bayCount ?? devices.length);
    const rows = Math.max(1, Math.ceil(devices.length / cols));
    const colWidth = xDim / cols;
    const rowHeight = yDim / rows;

    devices.forEach((device, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      out.set(device, {
        xPosition: round1(colWidth * (col + 0.5)),
        yPosition: round1(rowHeight * (row + 0.5)),
      });
    });
  }

  return out;
}
