import {
  getMapDeviceId,
  getDeviceIdFromSlotId,
} from '@/lib/sensor-map-positions'
import type { Bay, PlantSlot } from '@/types/farm.types'

export function buildDeviceToSlotMap(bay: Bay): Map<string, PlantSlot> {
  const map = new Map<string, PlantSlot>()
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        if (!slot) continue
        const device = getDeviceIdFromSlotId(slot.id)
        if (device) map.set(getMapDeviceId(device), slot)
      }
    }
  }
  return map
}
