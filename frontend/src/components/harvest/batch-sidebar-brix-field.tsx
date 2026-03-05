'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field'
import type { BrixMeasurementsFieldProps } from './batch-sidebar-types'

export function BrixMeasurementsField({
  measurements,
  onMeasurementChange,
  isLoading = false
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n()

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const nextIndex = currentIndex + 1
      if (nextIndex < 10) {
        // Focus next Brix field
        const nextInput = document.getElementById(`brix-${nextIndex + 1}`)
        nextInput?.focus()
      }
      // If it's the last Brix field, focus could move to photo upload or stay here
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const brixEntries = [
    { label: 'Brix 1', field: 'brix1' as const, value: measurements.brix1, placeholder: 'Enter Brix 1 value' },
    { label: 'Brix 2', field: 'brix2' as const, value: measurements.brix2, placeholder: 'Enter Brix 2 value' },
    { label: 'Brix 3', field: 'brix3' as const, value: measurements.brix3, placeholder: 'Enter Brix 3 value' },
    { label: 'Brix 4', field: 'brix4' as const, value: measurements.brix4, placeholder: 'Enter Brix 4 value' },
    { label: 'Brix 5', field: 'brix5' as const, value: measurements.brix5, placeholder: 'Enter Brix 5 value' },
    { label: 'Brix 6', field: 'brix6' as const, value: measurements.brix6, placeholder: 'Enter Brix 6 value' },
    { label: 'Brix 7', field: 'brix7' as const, value: measurements.brix7, placeholder: 'Enter Brix 7 value' },
    { label: 'Brix 8', field: 'brix8' as const, value: measurements.brix8, placeholder: 'Enter Brix 8 value' },
    { label: 'Brix 9', field: 'brix9' as const, value: measurements.brix9, placeholder: 'Enter Brix 9 value' },
    { label: 'Brix 10', field: 'brix10' as const, value: measurements.brix10, placeholder: 'Enter Brix 10 value' },
  ]

  // Calculate average Brix from non-zero measurements
  const brixValues = [
    measurements.brix1,
    measurements.brix2,
    measurements.brix3,
    measurements.brix4,
    measurements.brix5,
    measurements.brix6,
    measurements.brix7,
    measurements.brix8,
    measurements.brix9,
    measurements.brix10,
  ].filter(value => value > 0)
  
  const avgBrix = brixValues.length > 0 
    ? (brixValues.reduce((sum, val) => sum + val, 0) / brixValues.length)
    : 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium">QUALITY METRICS</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">BRIX MEASUREMENTS</p>
          <span className="text-sm text-muted-foreground">
            Average: <span className="text-lg text-orange-500 font-medium">
              {avgBrix > 0 ? avgBrix.toFixed(1) : '0.0'}°Bx
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {brixEntries.map((entry, index) => (
            <Field key={index}>
              <FieldLabel htmlFor={`brix-${index + 1}`}>
                {entry.label}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`brix-${index + 1}`}
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={entry.value === 0 ? '' : entry.value.toString()}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || 0
                    onMeasurementChange?.(entry.field, newValue)
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={entry.placeholder}
                  disabled={isLoading}
                />
              </FieldContent>
            </Field>
          ))}
        </div>
      </div>
    </div>
  )
}