'use client';

import { cn } from '@/lib/utils';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-muted/40 h-4 animate-pulse rounded-md', className)}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-border/60 bg-background/60 flex flex-col justify-between space-y-3 rounded-lg border p-4',
        className,
      )}
    >
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-7 w-20" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 bg-background/60 space-y-2 rounded-lg border p-4"
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
        <div className="border-border/60 bg-background/60 h-52 rounded-lg border p-4 md:col-span-2">
          <SkeletonBlock className="mb-3 h-4 w-32" />
          <div className="bg-muted/30 h-full animate-pulse rounded-md" />
        </div>
        <div className="border-border/60 bg-background/60 h-52 space-y-3 rounded-lg border p-4">
          <SkeletonBlock className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>

      {/* Trends / maintenance / zones */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border-border/60 bg-background/60 h-40 rounded-lg border p-4">
          <SkeletonBlock className="mb-3 h-4 w-28" />
          <div className="bg-muted/30 h-full animate-pulse rounded-md" />
        </div>
        <div className="border-border/60 bg-background/60 h-40 space-y-2 rounded-lg border p-4">
          <SkeletonBlock className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-40" />
          ))}
        </div>
        <div className="border-border/60 bg-background/60 h-40 space-y-2 rounded-lg border p-4">
          <SkeletonBlock className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-24" />
          ))}
        </div>
      </div>

      {/* Footer + actions */}
      <div className="border-border/60 bg-background/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
        <SkeletonBlock className="h-3 w-40" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
