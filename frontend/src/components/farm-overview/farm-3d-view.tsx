'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Farm, ParameterType } from '@/lib/farm-types'
import { PlantSlot as PlantSlotComponent } from './plant-slot'
import { cn } from '@/lib/utils'

interface Farm3DViewProps {
  farm: Farm
  parameter: ParameterType
  selectedSlotId: string | null
  selectedBatchId: string | null
  onSelectSlot: (slotId: string | null) => void
}

export function Farm3DView({
  farm,
  parameter,
  selectedSlotId,
  selectedBatchId,
  onSelectSlot,
}: Farm3DViewProps) {
  // Find the selected batch to get its bay IDs
  const selectedBatch = React.useMemo(() => {
    if (!selectedBatchId) return null
    return farm.batches.find((batch) => batch.id === selectedBatchId)
  }, [selectedBatchId, farm.batches])

  // Check if a bay belongs to the selected batch
  const isBaySelected = React.useCallback(
    (bayId: string) => {
      if (!selectedBatch) return false
      return selectedBatch.bayIds.includes(bayId)
    },
    [selectedBatch]
  )

  return (
    <Card className="h-full w-full border-0 shadow-none bg-transparent">
      <CardContent className="p-0 h-full w-full">
        <div className="h-full w-full overflow-x-auto overflow-y-hidden">
          {/* Clean heat map view */}
          <div className="h-full w-full flex items-stretch">
            {/* Bays arranged horizontally - 8 bays */}
            <div
              className="flex gap-3 sm:gap-4 flex-nowrap items-stretch h-full px-2 sm:px-3 py-2"
              style={{ minWidth: 'fit-content' }}
            >
              {farm.bays.slice(0, 8).map((bay) => {
                const isSelected = isBaySelected(bay.id)
                return (
                  <div key={bay.id} className="relative flex-shrink-0 h-full">
                    {/* Bay container - clean and modern */}
                    <div
                      className={cn(
                        'border-2 rounded-xl p-2 transition-all duration-300 flex flex-col h-full backdrop-blur-sm',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-xl ring-4 ring-primary/30'
                          : 'border-border/60 bg-card/80 hover:border-primary/40 hover:shadow-lg hover:bg-card/90'
                      )}
                      style={{
                        width: 'clamp(80px, 10vw, 140px)',
                        height: '100%',
                      }}
                    >
                      {/* Bay label */}
                      <div
                        className={cn(
                          'text-xs font-bold mb-1 text-center py-1.5 rounded-lg flex-shrink-0 transition-colors',
                          isSelected
                            ? 'text-primary-foreground bg-primary shadow-md'
                            : 'text-muted-foreground bg-muted/70 hover:bg-muted'
                        )}
                      >
                        {bay.name}
                      </div>
                      {/* Heat map grid - fills entire remaining space */}
                      <div
                        className="flex-1 grid grid-cols-12 overflow-hidden rounded"
                        style={{ gridAutoRows: '1fr', minHeight: 0 }}
                      >
                        {bay.rows.slice(0, 50).map((row, rowIndex) => {
                          const totalRows = 50
                          const positionPercent =
                            (rowIndex / (totalRows - 1)) * 100
                          // Bottom (100%) = darker (1.0), Top (0%) = lighter (0.5)
                          // More pronounced gradient for better visual effect
                          const opacityMultiplier =
                            0.5 + (positionPercent / 100) * 0.5
                          // Vertical position: 0 (top) to 1 (bottom) for temperature gradient
                          const verticalPosition = rowIndex / (totalRows - 1)

                          return row.columns.slice(0, 12).map((column) =>
                            column.slots.slice(0, 1).map((slot) => {
                              // Show parameter colors only if:
                              // 1. No batch is selected (show all), OR
                              // 2. This bay belongs to the selected batch
                              const shouldShowParameter =
                                !selectedBatchId || isSelected
                              return (
                                <div
                                  key={slot.id}
                                  className="w-full h-full"
                                  style={{ minHeight: 0 }}
                                >
                                  <PlantSlotComponent
                                    slot={slot}
                                    parameter={parameter}
                                    isSelected={selectedSlotId === slot.id}
                                    isActive={shouldShowParameter}
                                    opacityMultiplier={opacityMultiplier}
                                    verticalPosition={verticalPosition}
                                    onClick={() =>
                                      onSelectSlot(
                                        selectedSlotId === slot.id
                                          ? null
                                          : slot.id
                                      )
                                    }
                                  />
                                </div>
                              )
                            })
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
