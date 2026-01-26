'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { FeatureTableSkeleton } from './feature-table-skeleton'

export function FeatureFlagsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton - matches page header with icon */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      {/* Table Skeleton - matches Card structure */}
      <FeatureTableSkeleton />
    </div>
  )
}
