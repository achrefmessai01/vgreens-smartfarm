'use client';

import { DataTable, type Column } from '@/components/ui/data-table';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import type { Warning, WarningStatus } from '@/types/warning.types';
import * as React from 'react';
import { useWarningRow } from './warning-table-rows';

interface WarningTableProps {
  warnings: Warning[];
  onAcknowledge: (warning: Warning) => void;
  onResolve: (warning: Warning) => void;
  onRowClick?: (warning: Warning) => void;
  isAlert?: boolean;
}

export function WarningTable({
  warnings,
  onAcknowledge,
  onResolve,
  onRowClick,
  isAlert = false,
}: WarningTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const [statusFilter, setStatusFilter] = React.useState<WarningStatus | 'all'>(
    'all',
  );

  const translations = isAlert ? t.pages.alerts : t.pages.warnings;

  const filteredWarnings = React.useMemo(() => {
    if (statusFilter === 'all') {
      return warnings;
    }
    return warnings.filter((warning) => warning.status === statusFilter);
  }, [warnings, statusFilter]);

  // Get row and card renderers from dedicated modules
  const { renderRow, renderCard } = useWarningRow({
    onAcknowledge,
    onResolve,
    translations,
  });

  const columns: Column<Warning>[] = [
    {
      key: 'sensorName',
      header: translations.sensorName,
    },
    {
      key: 'value',
      header: translations.value,
    },
    {
      key: 'timestamp',
      header: translations.timestamp,
    },
    {
      key: 'tunnel',
      header: translations.tunnel,
      headerClassName: 'hidden md:table-cell',
    },
    {
      key: 'status',
      header: translations.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
    },
  ];

  return (
    <DataTable
      data={filteredWarnings}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      onRowClick={onRowClick}
      filterConfig={{
        label: translations.filterByStatus,
        value: statusFilter,
        options: [
          { label: translations.allStatuses, value: 'all' },
          { label: translations.open, value: 'open' },
          { label: translations.acknowledged, value: 'acknowledged' },
          { label: translations.resolved, value: 'resolved' },
        ],
        onFilterChange: (value) =>
          setStatusFilter(value as WarningStatus | 'all'),
      }}
      emptyState={{
        title: isAlert ? t.pages.alerts.noAlerts : t.pages.warnings.noWarnings,
        description: isAlert
          ? t.pages.alerts.noAlertsDescription
          : t.pages.warnings.noWarningsDescription,
      }}
      paginationVariant="compact"
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      responsiveBreakpoint="xl"
    />
  );
}
