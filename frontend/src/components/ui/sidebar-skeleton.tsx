'use client'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SidebarSkeletonProps {
  className?: string
}

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 border-r border-border dark:border-sidebar-border/70 bg-muted/30 dark:bg-background',
        className,
      )}
      aria-label="Loading sidebar"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border dark:border-sidebar-border/70 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 p-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
          >
            <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-28" style={{ opacity: 1 - i * 0.08 }} />
          </div>
        ))}
      </nav>

      {/* Other Menu */}
      <Separator className="bg-border dark:bg-sidebar-border/70" />
      <div className="px-4 py-2">
        <div className="px-3 py-1.5">
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-1">
          {/* Dark mode row */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Logout row */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-border dark:border-sidebar-border/70 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  )
}
