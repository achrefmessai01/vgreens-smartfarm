'use client';

import {
  DataTable,
  type Column,
  type FilterConfigOption,
} from '@/components/ui/data-table';
import type { SystemErrorData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useSystemErrorsRow } from './system-errors-table-rows';

interface SystemErrorsTableProps {
  errors: SystemErrorData[];
  isLoading?: boolean;
  onResolve: (error: SystemErrorData) => void;
  onViewDetails: (error: SystemErrorData) => void;
  isResolving?: boolean;
  filterConfigs?: FilterConfigOption[];
}

export function SystemErrorsTable({
  errors,
  isLoading = false,
  onResolve,
  onViewDetails,
  isResolving = false,
  filterConfigs,
}: SystemErrorsTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();

  // Get row and card renderers from dedicated modules
  const { renderRow, renderCard } = useSystemErrorsRow({
    onResolve,
    onViewDetails,
    isLoading,
    isResolving,
  });

  const columns: Column<SystemErrorData>[] = [
    { key: 'errorMessage', header: t.pages.admin.systemErrors.columnMessage },
    { key: 'component', header: t.pages.admin.systemErrors.columnComponent },
    { key: 'errorType', header: t.pages.admin.systemErrors.columnType },
    { key: 'source', header: t.pages.admin.systemErrors.columnSource },
    { key: 'severity', header: t.pages.admin.systemErrors.columnSeverity },
    { key: 'occurrenceCount', header: t.pages.admin.systemErrors.columnCount },
    { key: 'isResolved', header: t.pages.admin.systemErrors.columnStatus },
    { key: 'createdAt', header: t.pages.admin.systemErrors.columnCreated },
    { key: 'user', header: t.pages.admin.systemErrors.columnUser },
    {
      key: 'actions',
      header: t.pages.admin.systemErrors.columnActions,
      headerClassName: 'text-right',
    },
  ];

  return (
    <DataTable
      data={errors}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      responsiveBreakpoint="lg"
      responsiveMode="container"
      isLoading={isLoading}
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      paginationVariant="compact"
      emptyState={{ title: t.pages.admin.systemErrors.emptyTitle }}
      filterConfigs={filterConfigs}
    />
  );
}
