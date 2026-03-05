'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import type { BatchHeaderFieldProps, BatchStatsFieldProps } from './batch-sidebar-types'

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