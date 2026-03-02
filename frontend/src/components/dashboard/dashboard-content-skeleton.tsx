'use client'

import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 rounded-md bg-muted/40 animate-pulse',
        className,
      )}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-lg border border-border/60 bg-background/60 p-4 space-y-3',
        className,
      )}
    >
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-7 w-20" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  )
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-2"
          >
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-7 w-24" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Metric + progress + alert/recommendation cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Live map + device health */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-52 rounded-lg border border-border/60 bg-background/60 p-4">
          <SkeletonBlock className="h-4 w-32 mb-3" />
          <div className="h-full rounded-md bg-muted/30 animate-pulse" />
        </div>
        <div className="h-52 rounded-lg border border-border/60 bg-background/60 p-4 space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>

      {/* Trends / maintenance / zones */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-40 rounded-lg border border-border/60 bg-background/60 p-4">
          <SkeletonBlock className="h-4 w-28 mb-3" />
          <div className="h-full rounded-md bg-muted/30 animate-pulse" />
        </div>
        <div className="h-40 rounded-lg border border-border/60 bg-background/60 p-4 space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-40" />
          ))}
        </div>
        <div className="h-40 rounded-lg border border-border/60 bg-background/60 p-4 space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-24" />
          ))}
        </div>
      </div>

      {/* Footer + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-3">
        <SkeletonBlock className="h-3 w-40" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

