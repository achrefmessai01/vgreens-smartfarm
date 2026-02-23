/**
 * Schematic map layout: 115m (width) x 40m (height).
 * Positions as percentage of width (left) and height (top).
 * topPercent: 0 = top of map, 100 = bottom (so higher % = lower on screen = bottom of greenhouse).
 *
 * Field temperature devices A_01–A_12: 5 horizontal rows FROM BOTTOM TO TOP.
 * Row 1 = bottom, Row 5 = top. 3 columns: left, center, right. Empty cells have no entry.
 */

export type SensorMapType = 'air' | 'lux' | 'par' | 'soil'

export interface SensorMapPosition {
  deviceId: string
  leftPercent: number
  topPercent: number
  type: SensorMapType
}

/** Air A_01–A_12. From bottom to top: Row 1 (bottom) → Row 2 → Row 3 → Row 4 → Row 5 (top). */
export const SENSOR_MAP_POSITIONS: SensorMapPosition[] = [
  // Row 1 (bottom): A_02, A_03, A_04; soil sensor at same location as Air_03
  { deviceId: 'Air_02', leftPercent: 5, topPercent: 70, type: 'air' },
  { deviceId: 'Air_03', leftPercent: 5, topPercent: 40, type: 'air' },
  { deviceId: 'Soil_01', leftPercent: 5, topPercent: 40, type: 'soil' },
  { deviceId: 'Air_04', leftPercent: 5, topPercent: 10, type: 'air' },
  // Row 2: A_05, Empty, A_06
  { deviceId: 'Air_05', leftPercent: 15, topPercent: 70, type: 'air' },
  { deviceId: 'Air_06', leftPercent: 15, topPercent: 10, type: 'air' },
  // Row 3: A_07, Empty, A_08
  { deviceId: 'Air_07', leftPercent: 25, topPercent: 70, type: 'air' },
  { deviceId: 'Air_08', leftPercent: 25, topPercent: 10, type: 'air' },
  // // Row 4: A_09, Empty, A_10
  { deviceId: 'Air_09', leftPercent: 35, topPercent: 70, type: 'air' },
  { deviceId: 'Air_10', leftPercent: 35, topPercent: 10, type: 'air' },
  // Row 5 (top): A_11, A_01, A_12
  { deviceId: 'Air_11', leftPercent: 45, topPercent: 70, type: 'air' },
  { deviceId: 'Air_01', leftPercent: 45, topPercent: 40, type: 'air' },
  { deviceId: 'Air_12', leftPercent: 45, topPercent: 10, type: 'air' },
  // 6 lights: center line (same height as A_03, A_01), spanning left to right across greenhouse
  { deviceId: 'Lux_01', leftPercent: 10, topPercent: 40, type: 'lux' },
  { deviceId: 'Lux_02', leftPercent: 26, topPercent: 40, type: 'lux' },
  { deviceId: 'Lux_03', leftPercent: 42, topPercent: 40, type: 'lux' },
  { deviceId: 'Lux_04', leftPercent: 58, topPercent: 40, type: 'lux' },
  { deviceId: 'Lux_05', leftPercent: 74, topPercent: 40, type: 'lux' },
  { deviceId: 'Lux_06', leftPercent: 90, topPercent: 40, type: 'lux' },
]

/** Aspect ratio of map: width / height = 115 / 40 */
export const SENSOR_MAP_ASPECT_RATIO = 115 / 40

export const BAY_COUNT = 13

export const ROWS_PER_BAY = 3

export function getBayRowFromPosition(pos: SensorMapPosition): {
  bayIndex: number
  rowIndex: number
} {
  const bayIndex = Math.min(
    BAY_COUNT - 1,
    Math.floor((pos.leftPercent / 100) * BAY_COUNT),
  )
  const rowIndex = pos.topPercent < 25 ? 0 : pos.topPercent < 55 ? 1 : 2
  return { bayIndex, rowIndex }
}

export function getDeviceIdFromSlotId(slotId: string): string {
  const parts = slotId.replace(/^live_/, '').split('|')
  return parts[1] ?? ''
}

/**
 * Canonical device id for map lookup. Normalizes digits (Air_1 -> Air_01)
 * and maps Light_XX -> Lux_XX so backend light sensors show at Lux positions.
 */
export function getMapDeviceId(device: string): string {
  const match = device.match(/^(.+)_(\d+)$/i)
  if (!match) return device
  const prefix = match[1]
  const num = String(parseInt(match[2], 10)).padStart(2, '0')
  const mapPrefix = prefix === 'Light' ? 'Lux' : prefix
  return `${mapPrefix}_${num}`
}
