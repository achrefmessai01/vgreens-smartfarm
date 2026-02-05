/**
 * Schematic map layout: 115m (width) x 40m (height).
 * Positions as percentage of width (left) and height (top).
 * Device IDs match InfluxDB device tag (e.g. Air_01, Lux_01).
 */

export type SensorMapType = 'air' | 'lux' | 'par'

export interface SensorMapPosition {
  deviceId: string
  leftPercent: number
  topPercent: number
  type: SensorMapType
}

/** Fixed positions: 5 Air top, 2 Air middle (edges), 5 Air bottom, 5 Lux, 1 PAR */
export const SENSOR_MAP_POSITIONS: SensorMapPosition[] = [
  // Air sensors - top edge (5)
  { deviceId: 'Air_01', leftPercent: 10, topPercent: 5, type: 'air' },
  { deviceId: 'Air_02', leftPercent: 30, topPercent: 5, type: 'air' },
  { deviceId: 'Air_03', leftPercent: 50, topPercent: 5, type: 'air' },
  { deviceId: 'Air_04', leftPercent: 70, topPercent: 5, type: 'air' },
  { deviceId: 'Air_05', leftPercent: 90, topPercent: 5, type: 'air' },
  // Air sensors - middle on edges (2)
  { deviceId: 'Air_06', leftPercent: 5, topPercent: 50, type: 'air' },
  { deviceId: 'Air_07', leftPercent: 95, topPercent: 50, type: 'air' },
  // Air sensors - bottom edge (5)
  { deviceId: 'Air_08', leftPercent: 10, topPercent: 92, type: 'air' },
  { deviceId: 'Air_09', leftPercent: 30, topPercent: 92, type: 'air' },
  { deviceId: 'Air_10', leftPercent: 50, topPercent: 92, type: 'air' },
  { deviceId: 'Air_11', leftPercent: 70, topPercent: 92, type: 'air' },
  { deviceId: 'Air_12', leftPercent: 90, topPercent: 92, type: 'air' },
  // Lux sensors (5) - upper middle
  { deviceId: 'Lux_01', leftPercent: 20, topPercent: 32, type: 'lux' },
  { deviceId: 'Lux_02', leftPercent: 35, topPercent: 32, type: 'lux' },
  { deviceId: 'Lux_03', leftPercent: 50, topPercent: 32, type: 'lux' },
  { deviceId: 'Lux_04', leftPercent: 65, topPercent: 32, type: 'lux' },
  { deviceId: 'Lux_05', leftPercent: 80, topPercent: 32, type: 'lux' },
  // PAR & Lux (1) - center
  { deviceId: 'PAR_01', leftPercent: 50, topPercent: 42, type: 'par' },
]

/** Aspect ratio of map: width / height = 115 / 40 */
export const SENSOR_MAP_ASPECT_RATIO = 115 / 40

/** Get device id from slot id (e.g. "live_greenhouse_01|Air_01|unknown" -> "Air_01") */
export function getDeviceIdFromSlotId(slotId: string): string {
  const parts = slotId.replace(/^live_/, '').split('|')
  return parts[1] ?? ''
}
