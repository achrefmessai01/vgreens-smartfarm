'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import type { YieldDataFieldProps } from '@/types/batch-sidebar.types'

export function YieldDataField({
  marketable,
  waste,
  onYieldChange,
  isLoading = false,
}: YieldDataFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest
  const marketableRef = React.useRef<HTMLInputElement>(null)
  const wasteRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent, nextField: 'waste' | 'brix1') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextField === 'waste') {
        wasteRef.current?.focus()
      } else if (nextField === 'brix1') {
        document.getElementById('brix-1')?.focus()
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{h?.todaysHarvest ?? "Today's Harvest"}</h3>
        <span className="text-2xl font-bold text-teal-600">
          {marketable.toFixed(1)} kg
        </span>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">
          {h?.yieldData ?? 'Yield Data'}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{h?.marketable ?? 'Marketable'}</p>
            <div className="relative">
              <Input
                ref={marketableRef}
                type="number"
                min="0"
                step="0.1"
                value={marketable === 0 ? '' : marketable.toString()}
                onChange={(e) => onYieldChange?.('marketable', parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => handleKeyDown(e, 'waste')}
                className="text-center text-2xl font-light h-16 pr-12"
                placeholder={h?.enterMarketableYield ?? 'Enter marketable yield'}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">kg</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{h?.waste ?? 'Waste'}</p>
            <div className="relative">
              <Input
                ref={wasteRef}
                type="number"
                min="0"
                step="0.1"
                value={waste === 0 ? '' : waste.toString()}
                onChange={(e) => onYieldChange?.('waste', parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => handleKeyDown(e, 'brix1')}
                className="text-center text-2xl font-light h-16 pr-12"
                placeholder={h?.enterWasteAmount ?? 'Enter waste amount'}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
