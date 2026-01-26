'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { PlantSlot, ParameterType } from '@/lib/farm-types'
import { getParameterValue, getParameterColor } from '@/lib/farm-data'

interface PlantSlotProps {
  slot: PlantSlot
  parameter: ParameterType
  isSelected: boolean
  isActive: boolean // Whether to show parameter color or grayed out
  opacityMultiplier?: number // For gradient effect (0.5 to 1.0)
  verticalPosition?: number // 0 (top) to 1 (bottom) for temperature gradient
  onClick: () => void
}

export function PlantSlot({
  slot,
  parameter,
  isSelected,
  isActive,
  opacityMultiplier = 1.0,
  verticalPosition,
  onClick,
}: PlantSlotProps) {
  const value = getParameterValue(slot, parameter)
  const activeColor = getParameterColor(
    value,
    parameter,
    slot.id,
    verticalPosition
  )

  // Use the active color for all cells, control visibility via opacity
  const displayColor = activeColor

  // Apply gradient effect: base opacity multiplied by position-based multiplier
  // Bottom cells (opacityMultiplier = 1.0) are darker, top cells (0.5) are lighter
  // For active cells: full opacity with gradient (0.5-1.0)
  // For inactive cells: reduced but visible opacity (0.25-0.5)
  const baseOpacity = isActive ? 1.0 : 0.5
  const finalOpacity = Math.max(0.25, baseOpacity * opacityMultiplier)

  return (
    <div
      className={cn(
        'w-full h-full cursor-pointer transition-all duration-150',
        'hover:ring-2 hover:ring-primary/50 hover:z-10',
        isSelected && 'ring-2 ring-primary ring-offset-1 z-10 shadow-lg'
      )}
      onClick={onClick}
      style={{
        backgroundColor: displayColor,
        opacity: finalOpacity,
      }}
      title={
        isActive
          ? `${parameter}: ${value.toFixed(1)}`
          : `${parameter}: ${value.toFixed(1)} (Not selected)`
      }
    />
  )
}
