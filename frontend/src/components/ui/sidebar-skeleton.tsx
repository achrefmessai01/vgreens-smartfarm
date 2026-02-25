'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SidebarSkeletonProps {
  className?: string
}

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 border-r border-border dark:border-sidebar-border/70 bg-sidebar dark:bg-sidebar/95',
        className
      )}
      aria-label="Loading sidebar"
    >
      <div className="flex flex-col gap-6 p-4">
        {/* Logo / brand area */}
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-28" />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-full rounded-md"
              style={{ opacity: 1 - i * 0.06 }}
            />
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User block at bottom */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  )
}
