'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface FilterChip {
  id: string
  label: string
  valueLabel: string
  onRemove: () => void
}

export interface TableFilterChipsProps {
  chips: FilterChip[]
  className?: string
}

export function TableFilterChips({ chips, className }: TableFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="list"
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          role="listitem"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 pl-3 pr-1.5 py-1 text-sm"
        >
          <span className="text-muted-foreground">{chip.label}:</span>
          <span className="font-medium text-foreground">{chip.valueLabel}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
