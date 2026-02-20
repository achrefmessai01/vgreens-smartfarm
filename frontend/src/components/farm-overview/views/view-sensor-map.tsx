'use client'

import {
  getParameterUnit,
  getParameterColor,
  formatParameterDisplayValue,
} from '@/lib/farm-data'
import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  BAY_COUNT,
  ROWS_PER_BAY,
  getMapDeviceId,
  SENSOR_MAP_POSITIONS,
  getBayRowFromPosition,
} from '@/lib/sensor-map-positions'
import type { PlantSlot } from '@/lib/farm-types'
import type { ParameterType } from '@/lib/farm-types'
import type { ViewSensorMapProps } from '@/types/sensor-map'
import { buildDeviceToSlotMap } from '@/lib/sensor-map-utils'
import { isParameterSupportedByType } from '@/lib/sensor-map-parameter'

interface CellItem {
  slot: PlantSlot | null
  deviceId: string
  value: number | null
}

function buildBayRowToSlots(
  bay: ViewSensorMapProps['bay'],
  parameter: ParameterType,
  showOnlyFilledPositions: boolean,
): Map<string, CellItem[]> {
  const deviceToSlot = bay ? buildDeviceToSlotMap(bay) : new Map()
  const map = new Map<string, CellItem[]>()

  for (const pos of SENSOR_MAP_POSITIONS) {
    if (!isParameterSupportedByType(parameter, pos.type)) continue
    const slot = deviceToSlot.get(getMapDeviceId(pos.deviceId)) ?? null
    if (!slot && showOnlyFilledPositions) continue
    const value =
      slot && typeof slot.values?.[parameter] === 'number'
        ? (slot.values[parameter] as number)
        : null
    if (slot && (typeof value !== 'number' || Number.isNaN(value))) continue

    const { bayIndex, rowIndex } = getBayRowFromPosition(pos)
    const key = `${bayIndex}-${rowIndex}`
    const list = map.get(key) ?? []
    list.push({ slot, deviceId: pos.deviceId, value })
    map.set(key, list)
  }
  return map
}

export function ViewSensorMap(props: ViewSensorMapProps) {
  const { parameter, selectedSlotId, onSelectSlot, className } = props
  const unit = getParameterUnit(parameter)
  const bayRowToSlots = React.useMemo(
    () =>
      buildBayRowToSlots(
        props.bay,
        props.parameter,
        props.showOnlyFilledPositions ?? false,
      ),
    [props.bay, props.parameter, props.showOnlyFilledPositions],
  )

  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 w-full h-full rounded-lg border border-border/40 bg-background overflow-hidden',
        className,
      )}
    >
      {Array.from({ length: BAY_COUNT }, (_, bayIndex) => (
        <div
          key={bayIndex}
          className={cn(
            'flex flex-1 flex-col min-w-0 border-r border-border/60 last:border-r-0',
          )}
        >
          {Array.from({ length: ROWS_PER_BAY }, (_, rowIndex) => {
            const key = `${bayIndex}-${rowIndex}`
            const items = bayRowToSlots.get(key) ?? []
            return (
              <div
                key={rowIndex}
                className="flex flex-1 min-h-[72px] items-center justify-center gap-1 p-1 flex-wrap"
              >
                {items.map(({ slot, deviceId, value }) => {
                  const isSelected = slot ? selectedSlotId === slot.id : false
                  const backgroundColor = slot
                    ? getParameterColor(value ?? 0, parameter, slot.id)
                    : 'rgb(200, 200, 200)'
                  return (
                    <button
                      key={deviceId}
                      type="button"
                      onClick={() =>
                        onSelectSlot(
                          slot ? (isSelected ? null : slot.id) : null,
                        )
                      }
                      disabled={!slot}
                      title={
                        slot && value != null
                          ? `${deviceId}: ${formatParameterDisplayValue(value)}${unit}`
                          : deviceId
                      }
                      className={cn(
                        'flex flex-col items-center justify-center rounded-full transition-all tabular-nums',
                        'w-14 h-14 shrink-0',
                        'shadow-md ring-1 ring-black/10',
                        'hover:ring-2 hover:ring-primary hover:scale-105',
                        isSelected &&
                          'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        !slot && 'cursor-not-allowed opacity-60',
                      )}
                      style={{
                        backgroundColor,
                        color: slot
                          ? 'rgba(255,255,255,0.98)'
                          : 'var(--muted-foreground)',
                        textShadow: slot ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                      }}
                    >
                      {value != null ? (
                        <>
                          <span className="text-sm font-bold leading-tight">
                            {formatParameterDisplayValue(value)}
                          </span>
                          <span className="text-[10px] font-medium opacity-90">
                            {unit}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs">--</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
