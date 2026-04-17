'use client';

import {
  DataTable,
  type Column,
  type FilterConfigOption,
} from '@/components/ui/data-table';
import { SystemError } from '@/generated/graphql';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useSystemErrorsRow } from './system-errors-table-rows';

interface SystemErrorsTableProps {
  errors: SystemError[];
  isLoading?: boolean;
  onResolve: (error: SystemError) => void;
  onViewDetails: (error: SystemError) => void;
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
  const paginationConfig = usePaginationConfig();

  // Get row and card renderers from dedicated modules
  const { renderRow, renderCard } = useSystemErrorsRow({
    onResolve,
    onViewDetails,
    isLoading,
    isResolving,
  });

  const columns: Column<SystemError>[] = [
    { key: 'errorMessage', header: 'Message' },
    { key: 'component', header: 'Component' },
    { key: 'errorType', header: 'Type' },
    { key: 'source', header: 'Source' },
    { key: 'severity', header: 'Severity' },
    { key: 'occurrenceCount', header: 'Count' },
    { key: 'isResolved', header: 'Status' },
    { key: 'createdAt', header: 'Created' },
    { key: 'user', header: 'User' },
    { key: 'actions', header: 'Actions', headerClassName: 'text-right' },
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
      emptyState={{ title: 'No system errors found' }}
      filterConfigs={filterConfigs}
    />
  );
}
