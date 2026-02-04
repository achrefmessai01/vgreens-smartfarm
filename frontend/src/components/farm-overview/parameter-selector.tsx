'use client'

import * as React from 'react'
import { StyledSelect } from '@/components/ui/styled-select'
import type { ParameterType } from '@/lib/farm-types'
import { ParameterColorLegend } from './parameter-color-legend'

interface ParameterSelectorProps {
  value: ParameterType
  onValueChange: (value: ParameterType) => void
  options: { label: string; value: string }[]
  selectParameterLabel: string
}

export function ParameterSelector({
  value,
  onValueChange,
  options,
  selectParameterLabel,
}: ParameterSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">
          {selectParameterLabel}:
        </label>
        <StyledSelect
          value={value}
          onValueChange={(val) => onValueChange(val as ParameterType)}
          options={options}
          width="180px"
          triggerClassName="sm:w-[200px]"
        />
      </div>
      <div className="overflow-x-auto w-full sm:w-auto">
        <ParameterColorLegend parameter={value} />
      </div>
    </div>
  )
}
