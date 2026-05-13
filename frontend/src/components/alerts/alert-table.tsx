'use client';

import {
  useAlertTableColumns,
  useAlertTableFilters,
} from './alert-table-config';
import * as React from 'react';
import { useI18n } from '@/i18n';
import { Alert } from '@/generated/graphql';
import { useAlertTableRow } from './alert-table-rows';
import { DataTable } from '@/components/ui/data-table';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { getTimestampMs, type AlertTableUser } from './alert-table-utils';

interface AlertTableProps {
  alerts: Alert[];
  filter: AlertsFilterInput;
  onFilterChange: (updates: Partial<AlertsFilterInput>) => void;
  users: AlertTableUser[];
  onAcknowledge: (alert: Alert) => void;
  onResolve: (alert: Alert) => void;
  onEdit?: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
  onRowClick?: (alert: Alert) => void;
  isLoading?: boolean;
  tableLoading?: boolean;
}

export function AlertTable({
  alerts,
  filter,
  onFilterChange,
  users,
  onAcknowledge,
  onResolve,
  onEdit,
  onDelete,
  onRowClick,
  isLoading = false,
  tableLoading = false,
}: AlertTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();

  const columns = useAlertTableColumns();
  const filterConfigs = useAlertTableFilters(filter, onFilterChange, users);

  const actionHandlers = {
    onAcknowledge,
    onResolve,
    onEdit,
    onDelete,
    isLoading,
  };

  const { renderRow, renderCard } = useAlertTableRow(actionHandlers);

  const sortedAlerts = React.useMemo(
    () =>
      [...alerts].sort(
        (left, right) =>
          getTimestampMs(right.timestamp) - getTimestampMs(left.timestamp),
      ),
    [alerts],
  );

  // Local search state buffers keystrokes for instant input feedback. The
  // parent filter (which triggers a network refetch) only updates when the
  // user explicitly commits via Enter or blur.
  const [searchDraft, setSearchDraft] = React.useState(filter.search ?? '');

  // Re-sync the input when the parent filter changes from elsewhere (e.g.
  // chip removal) — but skip when the user is mid-typing.
  const lastCommittedRef = React.useRef(filter.search ?? '');
  React.useEffect(() => {
    const incoming = filter.search ?? '';
    if (incoming !== lastCommittedRef.current) {
      lastCommittedRef.current = incoming;
      setSearchDraft(incoming);
    }
  }, [filter.search]);

  const commitSearch = React.useCallback(
    (value: string) => {
      const next = value.trim();
      if (next === (filter.search ?? '')) return;
      lastCommittedRef.current = next;
      onFilterChange({ search: next || undefined });
    },
    [filter.search, onFilterChange],
  );

  const alertsT = t.pages.alerts as typeof t.pages.alerts & {
    searchPlaceholder?: string;
    dateRangePlaceholder?: string;
  };

  return (
    <DataTable
      data={sortedAlerts}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      onRowClick={onRowClick}
      searchConfig={{
        placeholder:
          alertsT.searchPlaceholder ??
          'Search by sensor name, acknowledged by, resolved by...',
      }}
      searchValue={searchDraft}
      onSearchChange={(value) => setSearchDraft(value)}
      onSearchCommit={commitSearch}
      filterConfigs={filterConfigs}
      dateRangeConfig={{
        dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : null,
        dateTo: filter.dateTo ? new Date(filter.dateTo) : null,
        onRangeChange: (from, to) =>
          onFilterChange({
            dateFrom: from?.toISOString().slice(0, 10) ?? undefined,
            dateTo: to?.toISOString().slice(0, 10) ?? undefined,
          }),
        placeholder: alertsT.dateRangePlaceholder ?? 'Select date range',
      }}
      emptyState={{
        title: t.pages.alerts.noAlerts,
        description: t.pages.alerts.noAlertsDescription,
      }}
      isLoading={tableLoading}
      paginationVariant="compact"
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      responsiveBreakpoint="xl"
    />
  );
}
