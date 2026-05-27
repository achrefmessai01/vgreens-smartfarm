'use client';

import { PageHeader } from '@/components/layout';
import {
  SystemErrorDetailsDialog,
  SystemErrorsFilters,
  SystemErrorsStatsCards,
  SystemErrorsTable,
} from '@/components/system-errors';
import { Badge } from '@/components/ui/badge';
import { ErrorSource, ReportSeverity, SystemError } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  useResolveSystemError,
  useSystemErrors,
  useSystemErrorStats,
} from '@/lib/hooks/use-system-errors';
import { useState } from 'react';

// ...existing code...

export default function AdminSystemErrorsPage() {
  const { t } = useI18n();
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<
    ReportSeverity | undefined
  >();
  const [sourceFilter, setSourceFilter] = useState<ErrorSource | undefined>();
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>();

  // Data fetching and mutations
  const { data, loading, refetch } = useSystemErrors({
    severity: severityFilter,
    source: sourceFilter,
    isResolved: resolvedFilter,
    limit: Infinity, // fetch all errors
  });

  useSystemErrorStats(24); // Last 24 hours
  const [resolveError, { loading: isResolving }] = useResolveSystemError();

  const errors = data?.getRecentSystemErrors || [];

  // Parse stats
  const stats = {
    total: errors.length,
    active: errors.filter((e) => !e.isResolved).length,
    resolved: errors.filter((e) => e.isResolved).length,
    critical: errors.filter((e) => e.severity === 'CRITICAL').length,
  };

  // Action handlers
  const handleResolveError = async (
    errorId: string,
    resolutionNotes?: string,
  ) => {
    try {
      await resolveError({
        variables: {
          errorId,
          resolutionNotes,
        },
      });
      await refetch();
      console.log('Error marked as resolved');
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const handleViewDetails = (error: SystemError) => {
    setSelectedError(error);
    setIsDetailsOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    console.log('Data refreshed');
  };

  const clearFilters = () => {
    setSeverityFilter(undefined);
    setSourceFilter(undefined);
    setResolvedFilter(undefined);
  };

  const activeFiltersCount = [
    severityFilter,
    sourceFilter,
    resolvedFilter,
  ].filter(Boolean).length;

  const containerClassName =
    'flex w-full min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 xl:gap-6';

  const listContainerClassName =
    'flex min-w-0 flex-col gap-3 lg:min-h-0 lg:flex-1 xl:gap-4';

  return (
    <div className={containerClassName}>
      <PageHeader
        title={t.pages.admin.systemErrors.title}
        subtitle={t.pages.admin.systemErrors.subtitle}
        className="mb-4 lg:mb-5 xl:mb-6"
      />

      {/* Stats Cards */}
      <SystemErrorsStatsCards stats={stats} />

      {/* Error List */}
      <div className={listContainerClassName}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold break-words">
            {t.pages.admin.systemErrors.listTitle}
          </h3>
          {activeFiltersCount > 0 && (
            <Badge variant="outline" className="w-fit">
              {(activeFiltersCount > 1
                ? t.pages.admin.systemErrors.filtersActivePlural
                : t.pages.admin.systemErrors.filtersActive
              ).replace('{count}', String(activeFiltersCount))}
            </Badge>
          )}
        </div>

        {/* Filters */}
        <SystemErrorsFilters
          severityFilter={severityFilter}
          sourceFilter={sourceFilter}
          resolvedFilter={resolvedFilter}
          setSeverityFilter={setSeverityFilter}
          setSourceFilter={setSourceFilter}
          setResolvedFilter={setResolvedFilter}
          handleRefresh={handleRefresh}
          clearFilters={clearFilters}
          loading={loading}
          activeFiltersCount={activeFiltersCount}
        />

        <div className="min-w-0 lg:min-h-0 lg:flex-1">
          <SystemErrorsTable
            errors={errors}
            isLoading={loading}
            onResolve={(error) => handleResolveError(error.id)}
            onViewDetails={handleViewDetails}
            isResolving={isResolving}
          />
        </div>
      </div>

      {/* Details Dialog */}
      <SystemErrorDetailsDialog
        error={selectedError}
        open={isDetailsOpen}
        onResolve={handleResolveError}
        isResolving={isResolving}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedError(null);
        }}
      />
    </div>
  );
}
