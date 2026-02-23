'use client'

import type { ParameterType } from '@/lib/farm-types'

interface ParameterSelectorProps {
  value: ParameterType
  onValueChange: (value: ParameterType) => void
  options: { label: string; value: string }[]
}

export function ParameterSelector({
  value,
  onValueChange,
  options,
}: ParameterSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value as ParameterType)}
            className={`
              group relative px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground/80 hover:bg-muted/30'
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
