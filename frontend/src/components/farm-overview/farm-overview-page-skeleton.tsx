'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FarmOverviewPageSkeletonProps {
  className?: string;
}

/** Mirrors one ParameterRow in combined view */
function ParameterRowSkeleton() {
  return (
    <div className="border-border/60 from-background to-background/95 mx-1 my-0.5 flex items-center justify-between rounded-md border bg-gradient-to-r px-3 py-1.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
        <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
    </div>
  );
}

/** Mirrors one GreenhouseSummaryCard */
function GreenhouseCardSkeleton() {
  return (
    <Card className="bg-card/80 w-full gap-0 overflow-hidden rounded-lg py-0">
      {/* Card header */}
      <div className="border-border/50 bg-muted/15 flex items-center gap-3 border-b px-3 py-2">
        <Skeleton className="h-3 w-28" />
      </div>
      <CardContent className="space-y-0.5 p-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <ParameterRowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

/** Mirrors the PAR graph section header + chart area */
function ParGraphSkeleton() {
  return (
    <Card className="w-full shrink-0 gap-0 overflow-hidden rounded-lg py-0">
      <div className="border-border/40 flex items-start justify-between border-b px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      {/* Chart area */}
      <div className="bg-muted/5 min-h-[15rem] w-full animate-pulse sm:min-h-[17rem] md:min-h-[20rem] lg:min-h-[24rem]" />
    </Card>
  );
}

export function FarmOverviewPageSkeleton({
  className,
}: FarmOverviewPageSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-background flex h-full min-h-0 w-full flex-col gap-6',
        className,
      )}
    >
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Greenhouse tab selector — mirrors GreenhouseSelector */}
      <div className="border-border/40 bg-muted/10 grid w-full grid-cols-3 border-b sm:flex">
        {/* First tab: active (teal fill) */}
        <Skeleton className="h-10 flex-1 rounded-l-md rounded-r-none" />
        <Skeleton className="h-10 flex-1 rounded-none opacity-40" />
        <Skeleton className="h-10 flex-1 rounded-l-none rounded-r-md opacity-40" />
      </div>

      {/* Greenhouse summary cards grid */}
      <div className="grid grid-cols-1 content-start items-stretch gap-1 pb-1 sm:grid-cols-2 sm:gap-2 xl:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))]">
        <GreenhouseCardSkeleton />
        <GreenhouseCardSkeleton />
      </div>

      {/* PAR graph section */}
      <ParGraphSkeleton />
    </div>
  );
}
