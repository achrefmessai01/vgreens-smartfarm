'use client';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/context';
import { cn } from '@/lib/utils';

export interface DashboardFooterProps {
  lastUpdated?: string;
  refreshLabel?: string;
  onRefresh?: () => void;
  className?: string;
}

export function DashboardFooter({
  lastUpdated,
  refreshLabel,
  onRefresh,
  className,
}: DashboardFooterProps) {
  const { t } = useI18n();

  lastUpdated = lastUpdated ?? t.pages.admin.dashboard.lastUpdated;
  refreshLabel = refreshLabel ?? t.pages.admin.dashboard.refresh;

  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center justify-between text-sm',
        className,
      )}
    >
      <div>{lastUpdated}</div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-md"
        onClick={onRefresh}
      >
        {refreshLabel}
      </Button>
    </div>
  );
}
