'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Bay, PlantSlot, ParameterType } from '@/lib/farm-types'
import {
  getParameterValue,
  getParameterColor,
  formatParameterDisplayValue,
} from '@/lib/farm-data'
import { cn } from '@/lib/utils'

const SENSOR_COLS = 4
const SENSOR_ROWS = 8

function sampleSensorSlots(bay: Bay): PlantSlot[] {
  const slots: PlantSlot[] = []
  const rowStep = Math.max(
    1,
    Math.floor((bay.rows.length - 1) / (SENSOR_ROWS - 1))
  )
  const numCols = bay.rows[0]?.columns.length ?? 12
  const colStep = Math.max(
    1,
    Math.floor((numCols - 1) / Math.max(1, SENSOR_COLS - 1))
  )

  for (let ri = 0; ri < SENSOR_ROWS; ri++) {
    const rowIndex = Math.min(ri * rowStep, bay.rows.length - 1)
    const row = bay.rows[rowIndex]
    if (!row) continue
    for (let ci = 0; ci < SENSOR_COLS; ci++) {
      const colIndex = Math.min(ci * colStep, row.columns.length - 1)
      const col = row.columns[colIndex]
      const slot = col?.slots[0]
      if (slot) slots.push(slot)
    }
  }
  return slots
}

/** Show all sensor slots that have data (no artificial limit) */
function getAllVisibleIndices(totalSlots: number): Set<number> {
  const indices = new Set<number>()
  for (let i = 0; i < totalSlots; i++) {
    indices.add(i)
  }
  return indices
}

interface SingleBayViewProps {
  bay: Bay
  parameter: ParameterType
  selectedSlotId: string | null
  onSelectSlot: (slotId: string | null) => void
  bayLabel?: string
  parameterLabel?: string
  noSensorLabel?: string
  className?: string
}

/** Mostly white backdrop with color-coded sensor dots/fields and visible readings */
export function SingleBayView({
  bay,
  parameter,
  selectedSlotId,
  onSelectSlot,
  bayLabel,
  className,
}: SingleBayViewProps) {
  const displayLabel = bayLabel ?? bay.name
  const sensorSlots = React.useMemo(() => sampleSensorSlots(bay), [bay])
  const visibleIndices = React.useMemo(
    () => getAllVisibleIndices(sensorSlots.length),
    [sensorSlots.length]
  )

  return (
    <Card
      className={cn(
        'h-full w-full border border-border/40 rounded-xl overflow-hidden',
        'bg-white dark:bg-background',
        className
      )}
    >
      <CardContent className="p-3 h-full flex flex-col min-h-0">
        <div
          className={cn(
            'text-xs font-bold mb-3 text-center py-2 rounded-lg flex-shrink-0',
            'text-muted-foreground bg-muted/40'
          )}
        >
          {displayLabel}
        </div>
        <div
          className="flex-1 min-h-0 overflow-auto bg-white dark:bg-background rounded-lg"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SENSOR_COLS}, minmax(0, 1fr))`,
            gap: 'clamp(16px, 2vw, 28px)',
            alignContent: 'start',
            alignItems: 'start',
            padding: 'clamp(8px, 1.5vw, 16px)',
          }}
        >
          {sensorSlots.map((slot, index) => {
            const showValue = visibleIndices.has(index)
            const value = getParameterValue(slot, parameter)
            const color = getParameterColor(value, parameter, slot.id)
            const isSelected = selectedSlotId === slot.id

            if (!showValue) {
              return (
                <div
                  key={slot.id}
                  className="w-24 h-24 shrink-0 rounded-lg bg-transparent"
                  aria-hidden
                />
              )
            }

            return (
              // <SensorHoverCard
              //   key={slot.id}
              //   parameter={parameter}
              //   value={value}
              //   unit={unit}
              //   slotId={slot.id}
              //   meta={slot.meta}
              // >
              <button
                type="button"
                key={slot.id}
                onClick={() => onSelectSlot(isSelected ? null : slot.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 w-24 h-24 shrink-0 rounded-lg transition-all',
                  'hover:ring-2 hover:ring-primary/50 hover:scale-[1.02]',
                  isSelected && 'ring-2 ring-primary ring-offset-2'
                )}
                style={{
                  backgroundColor: color,
                  color: 'rgba(255,255,255,0.98)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.5)',
                }}
              >
                <span className="text-md font-medium tabular-nums leading-tight drop-shadow-sm">
                  {formatParameterDisplayValue(value)}
                </span>
              </button>
              // </SensorHoverCard>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
