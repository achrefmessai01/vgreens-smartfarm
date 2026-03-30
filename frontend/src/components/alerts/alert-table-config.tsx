import * as React from 'react';
import {
  type Column,
  type FilterConfigOption,
} from '@/components/ui/data-table';
import { Alert, AlertSeverity, AlertStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { AlertTableUser, createUserOptions } from './alert-table-utils';

/**
 * Configuration for alert table filters and columns
 */

export const useAlertTableColumns = (): Column<Alert>[] => {
  const { t } = useI18n();

  return [
    { key: 'sensorName', header: t.pages.alerts.sensorName },
    { key: 'field', header: t.pages.alerts.field ?? 'Parameter' },
    { key: 'value', header: t.pages.alerts.value },
    { key: 'status', header: t.pages.alerts.status },
    { key: 'severity', header: t.pages.alerts.severity },
    { key: 'timestamp', header: t.pages.alerts.timestamp },
    { key: 'acknowledgedBy', header: t.pages.alerts.acknowledgedBy },
    { key: 'resolvedBy', header: t.pages.alerts.resolvedBy },
    {
      key: 'actions',
      header: t.pages.alerts.actions,
      headerClassName: 'text-right',
    },
  ];
};

export const useAlertTableFilters = (
  filter: AlertsFilterInput,
  onFilterChange: (updates: Partial<AlertsFilterInput>) => void,
  users: AlertTableUser[],
): FilterConfigOption[] => {
  const { t } = useI18n();

  const alertsT = t.pages.alerts as typeof t.pages.alerts & {
    searchPlaceholder?: string;
    filterBySeverity?: string;
    allSeverities?: string;
    filterByAcknowledgedBy?: string;
    filterByResolvedBy?: string;
    dateRangePlaceholder?: string;
    allUsers?: string;
  };

  const userOptionsForMulti = React.useMemo(
    () => createUserOptions(users),
    [users],
  );

  return React.useMemo(
    () => [
      {
        label: alertsT.filterByStatus,
        value: filter.statusIn?.length ? filter.statusIn.join(',') : '',
        options: [
          { label: alertsT.statusOpen, value: AlertStatus.Open },
          {
            label: alertsT.statusAcknowledged,
            value: AlertStatus.Acknowledged,
          },
          { label: alertsT.statusResolved, value: AlertStatus.Resolved },
        ],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            status: undefined,
            statusIn: value
              ? (value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean) as AlertStatus[])
              : undefined,
          }),
      },
      {
        label: alertsT.filterBySeverity ?? 'Severity',
        value: filter.severityIn?.length ? filter.severityIn.join(',') : '',
        options: [{ label: alertsT.critical, value: AlertSeverity.Critical }],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            severity: undefined,
            severityIn: value
              ? (value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean) as AlertSeverity[])
              : undefined,
          }),
      },
      {
        label: alertsT.filterByAcknowledgedBy ?? 'Acknowledged by',
        value: filter.acknowledgedByIdIn?.length
          ? filter.acknowledgedByIdIn.join(',')
          : '',
        options: userOptionsForMulti,
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            acknowledgedById: undefined,
            acknowledgedByIdIn: value
              ? value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : undefined,
          }),
      },
      {
        label: alertsT.filterByResolvedBy ?? 'Resolved by',
        value: filter.resolvedByIdIn?.length
          ? filter.resolvedByIdIn.join(',')
          : '',
        options: userOptionsForMulti,
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            resolvedById: undefined,
            resolvedByIdIn: value
              ? value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : undefined,
          }),
      },
    ],
    [
      alertsT,
      filter.acknowledgedByIdIn,
      filter.resolvedByIdIn,
      filter.severityIn,
      filter.statusIn,
      onFilterChange,
      userOptionsForMulti,
    ],
  );
};
