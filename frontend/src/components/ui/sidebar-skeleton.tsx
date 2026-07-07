'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useI18nOptional } from '@/i18n';
import { getTranslations } from '@/i18n/translations';
import { cn } from '@/lib/utils';

const fallbackT = getTranslations('en');

interface SidebarSkeletonProps {
  className?: string;
}

/**
 * Loading placeholder that mirrors the composition of `SidebarContent`:
 * header → tenant card → search → grouped nav → dark-mode row → user card.
 * Keeping the structure aligned prevents a visual jump when the real
 * sidebar mounts.
 */
export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  const t = useI18nOptional()?.t ?? fallbackT;
  return (
    <div
      className={cn(
        'bg-muted/20 dark:bg-background dark:border-sidebar-border/70 fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r lg:flex',
        className,
      )}
      aria-label={t.common.loadingSidebar}
    >
      {/* Header (brand + collapse toggle) */}
      <div className="border-border dark:border-sidebar-border/70 flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
      </div>

      {/* Tenant card */}
      <div className="px-4 pt-4">
        <div className="border-border/60 bg-muted/30 flex flex-col gap-1.5 rounded-lg border p-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-full" />
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Divider between the pinned header block and the scroll region. */}
      <div className="border-border/60 dark:border-sidebar-border/60 mx-4 mt-4 border-t" />

      {/* Grouped nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {[3, 2, 2].map((itemCount, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 py-1.5">
              <Skeleton className="h-3 w-20" />
            </div>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                <Skeleton
                  className="h-4 w-28"
                  style={{ opacity: 1 - (groupIdx * 3 + i) * 0.06 }}
                />
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Divider between the scroll region and the pinned footer block. */}
      <div className="border-border/60 dark:border-sidebar-border/60 mx-4 border-t" />

      {/* Dark mode row (flat: single icon + label + switch) */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-9 rounded-full" />
      </div>

      {/* User card (bordered card: avatar + name + role pill + logout icon) */}
      <div className="p-3">
        <div className="border-border/60 bg-background dark:bg-sidebar-accent/30 flex items-center gap-3 rounded-lg border p-2">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16 rounded-full opacity-70" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        </div>
      </div>
    </div>
  );
}
