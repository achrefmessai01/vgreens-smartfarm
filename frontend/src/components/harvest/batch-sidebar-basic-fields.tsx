'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { HarvestStatus } from '@/generated/graphql'
import type { BatchHeaderFieldProps, BatchStatsFieldProps } from './batch-sidebar-types'

const STATUS_VARIANT: Record<HarvestStatus, 'default' | 'secondary' | 'outline'> = {
  [HarvestStatus.Draft]: 'outline',
  [HarvestStatus.Active]: 'default',
  [HarvestStatus.Completed]: 'secondary',
  [HarvestStatus.Inactive]: 'outline',
}

const STATUS_COLOR: Record<HarvestStatus, string> = {
  [HarvestStatus.Draft]: 'bg-amber-500 hover:bg-amber-600',
  [HarvestStatus.Active]: 'bg-green-500 hover:bg-green-600',
  [HarvestStatus.Completed]: 'bg-blue-500 hover:bg-blue-600',
  [HarvestStatus.Inactive]: 'bg-gray-500 hover:bg-gray-600',
}

export function BatchHeaderField({
  name,
  species,
  variety,
  status,
  isLoading = false,
}: BatchHeaderFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  const STATUS_LABEL: Record<HarvestStatus, string> = {
    [HarvestStatus.Draft]: h?.statusDraft ?? 'Draft',
    [HarvestStatus.Active]: h?.statusActive ?? 'Active',
    [HarvestStatus.Completed]: h?.statusCompleted ?? 'Completed',
    [HarvestStatus.Inactive]: h?.statusInactive ?? 'Inactive',
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
          variant={STATUS_VARIANT[status] ?? 'outline'}
          className={STATUS_COLOR[status] ?? 'bg-gray-500'}
        >
          {STATUS_LABEL[status] ?? status} {h?.batchSuffix ?? 'Batch'}
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
  isLoading = false,
}: BatchStatsFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="h-4 bg-muted animate-pulse rounded flex-1" />
        <div className="h-4 bg-muted animate-pulse rounded w-16 ml-4" />
      </div>
    )
  }

  const dayText = (h?.dayAfterPlanting ?? 'Day {days} after planting').replace('{days}', String(daysAfterPlanting))

  return (
    <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-b pb-4">
      <span>📅 {dayText}</span>
      <span>📐 {h?.area ?? 'Area'}: {area} m²</span>
    </div>
  )
}
