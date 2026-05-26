'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useI18nOptional } from '@/i18n';
import { getTranslations } from '@/i18n/translations';
import { cn } from '@/lib/utils';

// Skeletons can render above I18nProvider as Suspense / loading fallbacks.
// Fall back to English if no provider is in scope yet.
const fallbackT = getTranslations('en');

interface ContentSkeletonProps {
  className?: string;
  /** Show a header bar (e.g. for page title area) */
  showHeader?: boolean;
  /** Number of content lines below header */
  lines?: number;
}

export function ContentSkeleton({
  className,
  showHeader = true,
  lines = 3,
}: ContentSkeletonProps) {
  const t = useI18nOptional()?.t ?? fallbackT;
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col gap-4 rounded-lg p-4',
        className,
      )}
      aria-label={t.common.loadingContent}
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
          <div className="grid grid-cols-1 content-start items-stretch gap-1 pb-1 sm:grid-cols-2 sm:gap-2 xl:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))]">
            {/* First Greenhouse Card Skeleton */}
            <div className="border-border bg-card/80 w-full gap-0 overflow-hidden rounded-lg border py-0">
              {/* Card Header */}
              <div className="border-border/50 bg-muted/15 flex items-center gap-3 border-b px-3 py-2">
                <Skeleton className="h-4 w-24" />
                <div className="ml-auto">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              {/* Parameter Rows */}
              <div className="p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'mx-1 my-0.5 flex items-center justify-between rounded-md px-3 py-1.5',
                      i % 2 === 0
                        ? 'bg-transparent'
                        : 'bg-slate-50 dark:bg-slate-800/50',
                    )}
                  >
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
            <div className="border-border bg-card/80 w-full gap-0 overflow-hidden rounded-lg border py-0">
              {/* Card Header */}
              <div className="border-border/50 bg-muted/15 flex items-center gap-3 border-b px-3 py-2">
                <Skeleton className="h-4 w-24" />
                <div className="ml-auto">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              {/* Parameter Rows */}
              <div className="p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'mx-1 my-0.5 flex items-center justify-between rounded-md px-3 py-1.5',
                      i % 2 === 0
                        ? 'bg-transparent'
                        : 'bg-slate-50 dark:bg-slate-800/50',
                    )}
                  >
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
          <div className="border-border bg-muted/60 h-full w-full rounded-lg border">
            <div className="border-border/50 border-b p-4">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-4">
              <Skeleton className="h-[200px] w-full rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
