import { Badge } from '@/components/ui/badge';
import { Alert, AlertSeverity, AlertStatus, User } from '@/generated/graphql';
import { useI18n, useLocaleFormatters } from '@/i18n';
import { AlertTriangle, CheckCircle, CheckCircle2 } from 'lucide-react';

export type LocaleFormatters = ReturnType<typeof useLocaleFormatters>;
export type Translations = ReturnType<typeof useI18n>['t'];

export type AlertTableUser = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email'
>;

/**
 * Formatting utilities for alert table display
 */

export const getStatusBadge = (
  status: AlertStatus,
  t: ReturnType<typeof useI18n>['t'],
) => {
  switch (status) {
    case AlertStatus.Open:
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertTriangle className="h-3 w-3" />
          {t.pages.alerts.statusOpen}
        </Badge>
      );
    case AlertStatus.Acknowledged:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-300 bg-amber-100 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <CheckCircle2 className="h-3 w-3" />
          {t.pages.alerts.statusAcknowledged}
        </Badge>
      );
    case AlertStatus.Resolved:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-300 bg-emerald-100 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {t.pages.alerts.statusResolved}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};

export const getSeverityBadge = (
  severity: AlertSeverity,
  t: ReturnType<typeof useI18n>['t'],
) => {
  switch (severity) {
    case AlertSeverity.Critical:
      return (
        <Badge variant="destructive" className="text-xs">
          {t.pages.alerts.critical}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {severity}
        </Badge>
      );
  }
};

export const getRowClassName = (alert: Alert): string => {
  if (alert.status === AlertStatus.Resolved) {
    return 'bg-emerald-50/70 dark:bg-emerald-950/30';
  }

  if (alert.status === AlertStatus.Acknowledged) {
    return 'bg-amber-50/60 dark:bg-amber-950/20';
  }

  if (
    alert.status === AlertStatus.Open &&
    alert.severity === AlertSeverity.Critical
  ) {
    return 'bg-red-50/80 dark:bg-red-950/40';
  }

  return '';
};

export const formatTimestamp = (
  timestamp: Alert['timestamp'] | null | undefined,
  formatters: LocaleFormatters,
): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return formatters.formatDateTime(date);
};

export const getTimestampMs = (
  timestamp?: Alert['timestamp'] | null,
): number => {
  if (!timestamp) return 0;
  const time = new Date(timestamp).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const formatFieldLabel = (
  field: string | null | undefined,
  t: Translations,
): string => {
  if (!field) return '-';

  const sensorLabels = t.pages.farmOverview.sensorFieldLabels;
  const labels: Record<string, string> = {
    temperature: sensorLabels.temperature,
    humidity: sensorLabels.humidity,
    vpd: sensorLabels.vpd,
    soil_moisture: sensorLabels.soilMoisture,
    soil_ec: sensorLabels.soilEC,
    soil_temp: sensorLabels.soilTemp,
    par: sensorLabels.par,
    co2: sensorLabels.co2,
  };

  return (
    labels[field] ??
    field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

export const formatUser = (user?: Alert['acknowledgedBy']): string => {
  if (!user) return '-';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email || '-';
};

/**
 * Create user options for multi-select filters
 */
export const createUserOptions = (users: AlertTableUser[]) => {
  return users.map((user) => {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      user.id;

    return { label: name, value: user.id };
  });
};
