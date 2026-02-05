'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Bay, PlantSlot, ParameterType } from '@/lib/farm-types'
import { getParameterValue, getParameterColor, getParameterUnit } from '@/lib/farm-data'
import {
  SENSOR_MAP_POSITIONS,
  SENSOR_MAP_ASPECT_RATIO,
  getDeviceIdFromSlotId,
} from '@/lib/sensor-map-positions'

function getAllSlotsFromBay(bay: Bay): PlantSlot[] {
  const slots: PlantSlot[] = []
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        if (slot) slots.push(slot)
      }
    }
  }
  return slots
}

/** Normalize device id for matching (e.g. Air_1 and Air_01 both match) */
function normalizeDeviceId(id: string): string {
  const match = id.match(/^(.+)_(\d+)$/i)
  if (!match) return id
  const num = parseInt(match[2], 10)
  return `${match[1]}_${String(num).padStart(2, '0')}`
}

function findSlotByDevice(slots: PlantSlot[], deviceId: string): PlantSlot | null {
  const normalized = normalizeDeviceId(deviceId)
  for (const slot of slots) {
    const slotDevice = getDeviceIdFromSlotId(slot.id)
    if (slotDevice === deviceId || slotDevice === normalized) return slot
    if (normalizeDeviceId(slotDevice) === normalized) return slot
  }
  return null
}

interface SensorMapViewProps {
  bay: Bay
  parameter: ParameterType
  selectedSlotId: string | null
  onSelectSlot: (slotId: string | null) => void
  bayLabel?: string
  className?: string
  /** When true, only show positions that have sensor data (no gray placeholders) */
  showOnlyFilledPositions?: boolean
}

/**
 * Schematic map view (115m x 40m) with sensor values at fixed positions.
 * Air = squares, Lux = circles, PAR = circle (pink).
 */
export function SensorMapView({
  bay,
  parameter,
  selectedSlotId,
  onSelectSlot,
  bayLabel,
  className,
  showOnlyFilledPositions = false,
}: SensorMapViewProps) {
  const slots = React.useMemo(() => getAllSlotsFromBay(bay), [bay])
  const unit = getParameterUnit(parameter)
  const positionsToShow = React.useMemo(() => {
    if (!showOnlyFilledPositions) return SENSOR_MAP_POSITIONS
    return SENSOR_MAP_POSITIONS.filter((pos) =>
      findSlotByDevice(slots, pos.deviceId)
    )
  }, [slots, showOnlyFilledPositions])

  return (
    <Card
      className={cn(
        'h-full w-full border border-border/40 rounded-xl overflow-hidden',
        'bg-white dark:bg-background',
        className
      )}
    >
      <CardContent className="p-3 h-full flex flex-col min-h-0">
        {bayLabel && (
          <div
            className={cn(
              'text-xs font-bold mb-3 text-center py-2 rounded-lg flex-shrink-0',
              'text-muted-foreground bg-muted/40'
            )}
          >
            {bayLabel}
          </div>
        )}
        {/* Map container: aspect ratio 115:40, min height so it stays visible */}
        <div
          className="flex-1 min-h-[200px] relative rounded-lg bg-muted/20 border border-border/40 overflow-hidden"
          style={{ aspectRatio: String(SENSOR_MAP_ASPECT_RATIO) }}
        >
          <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground/80">
            115m × 40m
          </span>
          {positionsToShow.map((pos) => {
            const slot = findSlotByDevice(slots, pos.deviceId)
            const value = slot ? getParameterValue(slot, parameter) : null
            const color = slot
              ? getParameterColor(value ?? 0, parameter, slot.id)
              : 'rgb(200, 200, 200)'
            const isSelected = slot ? selectedSlotId === slot.id : false
            const isAir = pos.type === 'air'
            const isPar = pos.type === 'par'

            return (
              <div
                key={pos.deviceId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.leftPercent}%`,
                  top: `${pos.topPercent}%`,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelectSlot(slot ? (isSelected ? null : slot.id) : null)
                  }
                  disabled={!slot}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-all text-sm font-semibold tabular-nums',
                    'hover:ring-2 hover:ring-primary/50 hover:scale-105',
                    isSelected && 'ring-2 ring-primary ring-offset-2',
                    !slot && 'cursor-not-allowed border border-border'
                  )}
                  style={{
                    backgroundColor: color,
                    color: slot
                      ? 'rgba(255,255,255,0.98)'
                      : 'var(--muted-foreground)',
                    boxShadow: slot
                      ? '0 1px 3px rgba(0,0,0,0.15)'
                      : '0 1px 2px rgba(0,0,0,0.08)',
                    textShadow: slot
                      ? '0 1px 2px rgba(0,0,0,0.4)'
                      : 'none',
                    borderRadius: isAir ? '8px' : '50%',
                    width: isPar ? 52 : 44,
                    height: isPar ? 52 : 44,
                  }}
                  title={slot ? `${pos.deviceId}: ${(value ?? 0).toFixed(1)}${unit}` : pos.deviceId}
                >
                  {value != null ? (
                    <span className="leading-tight text-sm font-bold px-0.5">
                      {value.toFixed(1)}
                    </span>
                  ) : (
                    <span className={slot ? 'opacity-90' : 'text-muted-foreground'}>
                      --
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
