import type { Bay, ParameterType } from '@/lib/farm-types'

export interface ViewSingleBayProps {
  bay: Bay
  parameter: ParameterType
  selectedSlotId: string | null
  onSelectSlot: (slotId: string | null) => void
  bayLabel?: string
  parameterLabel?: string
  noSensorLabel?: string
  className?: string
}

export type SensorGridPosition = readonly [col: number, row: number]
