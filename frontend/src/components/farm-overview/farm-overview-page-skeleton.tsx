'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FarmOverviewPageSkeletonProps {
  showTenantSelector?: boolean
  className?: string
}

export function FarmOverviewPageSkeleton({
  showTenantSelector = false,
  className,
}: FarmOverviewPageSkeletonProps) {
  return (
    <div className={cn('space-y-6 bg-background', className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {showTenantSelector && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/40">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-10 w-full sm:w-[280px] rounded-md" />
        </div>
      )}

      <Card className="h-full gap-0 py-0 overflow-hidden dark:shadow-lg">
        <div className="shrink-0 flex flex-col bg-muted/10">
          <div className="px-4 pt-4">
            <div className="flex gap-1 rounded-lg bg-muted/40 p-0.5">
              <Skeleton className="h-9 flex-1 max-w-[140px] rounded-md" />
              <Skeleton className="h-9 flex-1 max-w-[140px] rounded-md" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border/40 bg-background">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-[180px] rounded-md" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex bg-background dark:bg-background/50">
          <div className="flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
