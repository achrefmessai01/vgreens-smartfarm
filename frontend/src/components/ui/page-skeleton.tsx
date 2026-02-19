'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PageSkeletonProps {
  className?: string
}

export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-background',
        className
      )}
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/5 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-3 w-32 rounded-full opacity-80" />
        </div>
      </div>
    </div>
  )
}
