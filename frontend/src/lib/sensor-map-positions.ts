/**
 * Sensor map positioning using x/y coordinates (in meters).
 * Sensors are placed at (xPosition, yPosition) within a greenhouse
 * of dimensions (xDimension × yDimension).
 */

import type { DoorPosition } from '@/generated/graphql';
import type { Bay, PlantSlot } from '@/types/farm.types';

export type SensorMapType = 'air' | 'lux' | 'par' | 'soil';

/** Farm layout configuration — used for chambersCount and fallback bay grid. */
export interface FarmLayoutConfig {
  bayCount: number;
  polesMax: number;
  chambersCount: number;
}

/** Greenhouse physical dimensions in meters. */
export interface GreenhouseDimensions {
  xDimension: number;
  yDimension: number;
  doorPosition?: DoorPosition | null;
}

/** Default layout values — chambersCount used for greenhouse tabs. */
export const DEFAULT_FARM_LAYOUT: FarmLayoutConfig = {
  bayCount: 13,
  polesMax: 10,
  chambersCount: 2,
};

/**
 * Convert an x/y coordinate (in meters) to percentage positions on the canvas.
 * leftPercent: 0 = left edge, 100 = right edge.
 * topPercent: 0 = top edge, 100 = bottom edge.
 */
export function getPositionFromXY(
  x: number,
  y: number,
  dims: GreenhouseDimensions,
): { leftPercent: number; topPercent: number } {
  return {
    leftPercent: Math.max(0, Math.min(100, (x / dims.xDimension) * 100)),
    // y=0 is bottom-left (entrance); invert so y increases upward
    topPercent: Math.max(0, Math.min(100, (1 - y / dims.yDimension) * 100)),
  };
}

/** Derive sensor type from device id (e.g. Air_02 → air, Soil_01 → soil). */
export function getSensorTypeFromDeviceId(deviceId: string): SensorMapType {
  const normalized = getMapDeviceId(deviceId);
  if (/^Lux_/i.test(normalized) || /^Light_/i.test(deviceId)) return 'lux';
  if (/^Soil_/i.test(normalized)) return 'soil';
  if (/^Air_/i.test(normalized) || /^A_\d+/i.test(deviceId)) return 'air';
  return 'air';
}

/** Slot with computed canvas position. */
export interface SlotWithPosition {
  slot: PlantSlot;
  deviceId: string;
  leftPercent: number;
  topPercent: number;
  type: SensorMapType;
  bayIndex: number;
  rowIndex: number;
}

/**
 * Build list of slot positions using x/y coordinates from slot.meta.
 * Only returns slots that have valid xPosition and yPosition values.
 * dims is required — without greenhouse dimensions there is no canvas to place sensors on.
 */
export function getSlotPositionsFromBay(
  bay: Bay,
  _layout?: FarmLayoutConfig,
  dims?: GreenhouseDimensions,
): SlotWithPosition[] {
  if (!dims) return [];

  const out: SlotWithPosition[] = [];
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        if (!slot?.meta) continue;

        const x = slot.meta.xPosition as number | undefined;
        const y = slot.meta.yPosition as number | undefined;
        // Skip if not set or if both are 0 (database default — means "not positioned")
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (x === 0 && y === 0) continue;

        const deviceId = getDeviceIdFromSlotId(slot.id);
        if (!deviceId) continue;

        const { leftPercent, topPercent } = getPositionFromXY(x!, y!, dims);
        out.push({
          slot,
          deviceId,
          leftPercent,
          topPercent,
          type: getSensorTypeFromDeviceId(deviceId),
          bayIndex: 0,
          rowIndex: 0,
        });
      }
    }
  }
  return out;
}

/** Check if a bay has any slots with x/y position metadata. */
export function bayHasDynamicPositions(bay: Bay): boolean {
  for (const r of bay.rows) {
    for (const c of r.columns) {
      for (const slot of c.slots) {
        if (
          slot?.meta &&
          Number.isFinite(slot.meta.xPosition) &&
          Number.isFinite(slot.meta.yPosition)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export interface ParsedLiveSensorSlotId {
  greenhouse: string;
  device: string;
  level: string;
}

export function parseLiveSensorSlotId(slotId: string): ParsedLiveSensorSlotId {
  const parts = slotId.replace(/^live_/, '').split('|');
  return {
    greenhouse: parts[0] ?? '',
    device: parts[1] ?? '',
    level: parts[2] ?? '',
  };
}

export function getDeviceIdFromSlotId(slotId: string): string {
  return parseLiveSensorSlotId(slotId).device;
}

/**
 * Canonical device id for map lookup. Normalizes digits (Air_1 → Air_01)
 * and maps Light_XX → Lux_XX.
 */
export function getMapDeviceId(device: string): string {
  const match = device.match(/^(.+)_(\d+)$/i);
  if (!match) return device;
  const prefix = match[1];
  const num = String(parseInt(match[2], 10)).padStart(2, '0');
  const mapPrefix = prefix === 'Light' ? 'Lux' : prefix;
  return `${mapPrefix}_${num}`;
}
