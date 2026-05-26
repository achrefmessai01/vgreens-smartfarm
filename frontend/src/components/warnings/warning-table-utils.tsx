import { Badge } from '@/components/ui/badge';
import type { useI18n, useLocaleFormatters } from '@/i18n';
import type { WarningStatus } from '@/types/warning.types';
import { AlertCircle, CheckCircle, CheckCircle2 } from 'lucide-react';

export type LocaleFormatters = ReturnType<typeof useLocaleFormatters>;
export type Translations = ReturnType<typeof useI18n>['t'];

/**
 * Utility functions for warning table
 */

interface GetStatusBadgeProps {
  status: WarningStatus;
  translations: {
    open: string;
    acknowledged: string;
    resolved: string;
  };
}

export const getStatusBadge = ({
  status,
  translations,
}: GetStatusBadgeProps) => {
  const statusConfig = {
    open: {
      label: translations.open,
      variant: 'destructive' as const,
      icon: AlertCircle,
    },
    acknowledged: {
      label: translations.acknowledged,
      variant: 'secondary' as const,
      icon: CheckCircle2,
    },
    resolved: {
      label: translations.resolved,
      variant: 'default' as const,
      icon: CheckCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export const formatTimestamp = (
  timestamp: string,
  formatters: LocaleFormatters,
  t: Translations,
) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.common.justNow;
  if (diffMins < 60)
    return t.common.minutesAgoCompact.replace('{count}', String(diffMins));
  if (diffHours < 24)
    return t.common.hoursAgoCompact.replace('{count}', String(diffHours));
  if (diffDays < 7)
    return t.common.daysAgoCompact.replace('{count}', String(diffDays));
  return formatters.formatDate(date);
};
