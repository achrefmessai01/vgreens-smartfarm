'use client';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18nOptional } from '@/i18n';
import { getTranslations } from '@/i18n/translations';
import { cn } from '@/lib/utils';

const fallbackT = getTranslations('en');

interface SidebarSkeletonProps {
  className?: string;
}

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        'border-border dark:border-sidebar-border/70 bg-muted/30 dark:bg-background fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r lg:flex',
        className,
      )}
      aria-label={t.common.loadingSidebar}
    >
      {/* Header */}
      <div className="border-border dark:border-sidebar-border/70 flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
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
      <div className="border-border dark:border-sidebar-border/70 border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20 opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}
