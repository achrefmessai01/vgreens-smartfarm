/**
 * Sensor map layout: positions as percentage of width (left) and height (top).
 * topPercent: 0 = top of map, 100 = bottom.
 *
 * Layout uses bay (1–13) and pole (1–10) from InfluxDB slot meta.
 * - bay = column (horizontal position)
 * - pole = row (vertical position); 10 rows total.
 * Device IDs vary per greenhouse (e.g. A_01–A_12, A_13–A_24).
 */

import type { Bay, PlantSlot } from '@/types/farm.types';

export type SensorMapType = 'air' | 'lux' | 'par' | 'soil';

// --- Dynamic layout: bay (column) + pole (row) only ---

/** Max bays per greenhouse (1–13). */
export const BAY_COUNT = 13;

/** Total pole rows (vertical). Pole = which row to show. */
export const POLES_MAX = 10;

/** Pole rows hidden from the UI. Values are 1-based to match InfluxDB metadata. */
export const HIDDEN_POLE_ROWS = [5] as const;

const HIDDEN_POLE_ROW_SET = new Set<number>(HIDDEN_POLE_ROWS);

/** Pole rows that remain visible after filtering hidden rows. */
export const VISIBLE_POLE_ROWS = Array.from(
  { length: POLES_MAX },
  (_, index) => index + 1,
).filter((pole) => !HIDDEN_POLE_ROW_SET.has(pole));

/** Rows per bay for discrete grid after hidden pole rows are removed. */
export const ROWS_PER_BAY = VISIBLE_POLE_ROWS.length;

export function isPoleRowHidden(pole: number): boolean {
  return HIDDEN_POLE_ROW_SET.has(Math.round(pole));
}

/**
 * Compute map position from bay and pole only.
 * bay = column (1–13), pole = row (1–10).
 */
export function getPositionFromBayPole(
  bay: number,
  pole: number,
): { leftPercent: number; topPercent: number } {
  const bay1 = Math.max(1, Math.min(BAY_COUNT, Math.round(bay)));
  const pole1 = Math.max(1, Math.min(POLES_MAX, Math.round(pole)));
  const visiblePoleIndex = VISIBLE_POLE_ROWS.indexOf(pole1);

  const leftPercent = ((bay1 - 0.5) / BAY_COUNT) * 100;
  const topPercent =
    visiblePoleIndex >= 0
      ? ((visiblePoleIndex + 0.5) / ROWS_PER_BAY) * 100
      : ((pole1 - 0.5) / POLES_MAX) * 100;

  return { leftPercent, topPercent };
}

/**
 * Derive sensor type from device id (e.g. Air_02 -> air, Soil_01 -> soil, Lux_01 -> lux).
 * Works for any greenhouse (A_13, A_14, etc.).
 */
export function getSensorTypeFromDeviceId(deviceId: string): SensorMapType {
  const normalized = getMapDeviceId(deviceId);
  if (/^Lux_/i.test(normalized) || /^Light_/i.test(deviceId)) return 'lux';
  if (/^Soil_/i.test(normalized)) return 'soil';
  if (/^Air_/i.test(normalized) || /^A_\d+/i.test(deviceId)) return 'air';
  return 'air';
}

/** Slot with computed position (from meta.bay, meta.pole). */
export interface SlotWithPosition {
  slot: PlantSlot;
  deviceId: string;
  leftPercent: number;
  topPercent: number;
  type: SensorMapType;
  /** bay index 0-based for grid key */
  bayIndex: number;
  /** row index (pole) 0-based for grid key */
  rowIndex: number;
}

/**
 * Build list of slot positions from bay data using bay and pole in slot.meta.
 * Use this for dynamic layout when InfluxDB provides bay/pole.
 * Returns only slots that have valid meta.bay and meta.pole.
 */
export function getSlotPositionsFromBay(bay: Bay): SlotWithPosition[] {
  const out: SlotWithPosition[] = [];
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        if (!slot?.meta) continue;
        const rawBay = slot.meta.bay as number | undefined;
        const rawPole = slot.meta.pole as number | undefined;
        if (!Number.isFinite(rawBay) || !Number.isFinite(rawPole)) {
          continue;
        }
        const bayNum = Number(rawBay);
        const poleNum = Number(rawPole);
        if (isPoleRowHidden(poleNum)) continue;

        const visiblePole = Math.max(1, Math.min(POLES_MAX, Math.round(poleNum)));
        const rowIndex = VISIBLE_POLE_ROWS.indexOf(visiblePole);
        if (rowIndex < 0) continue;

        const deviceId = getDeviceIdFromSlotId(slot.id);
        if (!deviceId) continue;
        const { leftPercent, topPercent } = getPositionFromBayPole(
          bayNum,
          poleNum,
        );
        const type = getSensorTypeFromDeviceId(deviceId);
        const bayIndex = Math.min(
          BAY_COUNT - 1,
          Math.max(0, Math.floor(bayNum) - 1),
        );
        out.push({
          slot,
          deviceId,
          leftPercent,
          topPercent,
          type,
          bayIndex,
          rowIndex,
        });
      }
    }
  }
  return out;
}

/** Check if a bay has any slots with dynamic position meta (bay, pole). */
export function bayHasDynamicPositions(bay: Bay): boolean {
  for (const r of bay.rows) {
    for (const c of r.columns) {
      for (const slot of c.slots) {
        if (
          slot?.meta &&
          Number.isFinite(slot.meta.bay) &&
          Number.isFinite(slot.meta.pole)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export const SENSOR_MAP_ASPECT_RATIO = 115 / 40;

export function getDeviceIdFromSlotId(slotId: string): string {
  const parts = slotId.replace(/^live_/, '').split('|');
  return parts[1] ?? '';
}

/**
 * Canonical device id for map lookup. Normalizes digits (Air_1 -> Air_01)
 * and maps Light_XX -> Lux_XX so backend light sensors show at Lux positions.
 */
export function getMapDeviceId(device: string): string {
  const match = device.match(/^(.+)_(\d+)$/i);
  if (!match) return device;
  const prefix = match[1];
  const num = String(parseInt(match[2], 10)).padStart(2, '0');
  const mapPrefix = prefix === 'Light' ? 'Lux' : prefix;
  return `${mapPrefix}_${num}`;
}
