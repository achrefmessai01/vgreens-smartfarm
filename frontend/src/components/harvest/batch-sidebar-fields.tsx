'use client'

import * as React from 'react'
import { Upload } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import type {
  BatchHeaderFieldProps,
  BatchStatsFieldProps,
  YieldDataFieldProps,
  BrixMeasurementsFieldProps,
  PhotosFieldProps
} from './batch-sidebar-types'

export function BatchHeaderField({
  name,
  species,
  variety,
  status,
  isLoading = false
}: BatchHeaderFieldProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-600'
      case 'completed': return 'bg-blue-500 hover:bg-blue-600'
      case 'inactive': return 'bg-gray-500 hover:bg-gray-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{name}</h2>
        <Badge  
          variant={getStatusVariant(status)}
          className={getStatusColor(status)}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)} Batch
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {species} • {variety}
      </p>
    </div>
  )
}

export function BatchStatsField({
  daysAfterPlanting,
  area,
  isLoading = false
}: BatchStatsFieldProps) {
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="h-4 bg-muted animate-pulse rounded flex-1" />
        <div className="h-4 bg-muted animate-pulse rounded w-16 ml-4" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-b pb-4">
      <span>📅 Day {daysAfterPlanting} after planting</span>
      <span>📐 Area: {area} m²</span>
    </div>
  )
}

export function YieldDataField({
  marketable,
  waste,
  onYieldChange,
  isLoading = false
}: YieldDataFieldProps) {
  const { t } = useI18n()

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
      <h3 className="font-medium">Today's Harvest</h3>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">YIELD DATA</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Marketable</p>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1"
                value={Math.round(marketable)}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 0
                  onYieldChange?.('marketable', newValue)
                }}
                className="text-center text-2xl font-light h-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Waste</p>
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1"
                value={Math.round(waste)}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 0
                  onYieldChange?.('waste', newValue)
                }}
                className="text-center text-2xl font-light h-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}