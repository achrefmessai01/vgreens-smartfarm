'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ContentSkeletonProps {
  className?: string
  /** Show a header bar (e.g. for page title area) */
  showHeader?: boolean
  /** Number of content lines below header */
  lines?: number
}

export function ContentSkeleton({
  className,
  showHeader = true,
  lines = 3,
}: ContentSkeletonProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col gap-4 rounded-lg p-4',
        className
      )}
      aria-label="Loading content"
    >
      {showHeader && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full opacity-80" />
          </div>
        </div>
      )}
      {lines > 0 && (
        <div className="flex flex-1 flex-col gap-3 pt-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 w-full max-w-full"
              style={{ width: `${100 - i * 8}%` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
