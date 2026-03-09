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
        <div className="flex h-full min-h-0 flex-col gap-3">
          {/* Combined Greenhouse Cards Grid */}
          <div className="grid grid-cols-1 gap-1 pb-1 content-start items-stretch sm:grid-cols-2 sm:gap-2 xl:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))]">
            {/* First Greenhouse Card Skeleton */}
            <div className="w-full gap-0 py-0 overflow-hidden rounded-lg border border-border bg-card/80">
              {/* Card Header */}
              <div className="flex items-center gap-3 border-b border-border/50 bg-muted/15 px-3 py-2">
                <Skeleton className="h-4 w-24" />
                <div className="ml-auto">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              {/* Parameter Rows */}
              <div className="p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between px-3 py-1.5 mx-1 my-0.5 rounded-md",
                    i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50'
                  )}>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-12 rounded-full" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Greenhouse Card Skeleton */}
            <div className="w-full gap-0 py-0 overflow-hidden rounded-lg border border-border bg-card/80">
              {/* Card Header */}
              <div className="flex items-center gap-3 border-b border-border/50 bg-muted/15 px-3 py-2">
                <Skeleton className="h-4 w-24" />
                <div className="ml-auto">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              {/* Parameter Rows */}
              <div className="p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between px-3 py-1.5 mx-1 my-0.5 rounded-md",
                    i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50'
                  )}>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-12 rounded-full" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* PAR Graph Section Skeleton */}
          <div className="h-full w-full border border-border rounded-lg bg-muted/60">
            <div className="p-4 border-b border-border/50">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-4">
              <Skeleton className="h-[200px] w-full rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
