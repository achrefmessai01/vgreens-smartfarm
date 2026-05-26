'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { SystemError, ReportSeverity, ErrorSource } from '@/generated/graphql';
import {
  GET_RECENT_SYSTEM_ERRORS,
  GET_SYSTEM_ERROR_STATS,
  RESOLVE_SYSTEM_ERROR,
} from '@/graphql/operations/system-errors';
import { SystemErrorStatsCards } from './system-error-stats-cards';
import { SystemErrorFilters } from './system-error-filters';
import { SystemErrorsList } from './system-errors-list';
import { SystemErrorData } from './system-error-card';
import { useI18n } from '@/i18n';

export function SystemErrorsDashboard() {
  const { t } = useI18n();
  const [filters, setFilters] = React.useState({
    severity: '',
    source: '',
    showResolved: false,
    searchTerm: '',
  });

  const { data, loading, error, refetch } = useQuery(GET_RECENT_SYSTEM_ERRORS, {
    variables: {
      limit: 50,
      severity: filters.severity || undefined,
      source: filters.source || undefined,
      isResolved: filters.showResolved || undefined,
    },
    pollInterval: 30000,
  });

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_SYSTEM_ERROR_STATS,
    {
      variables: { hours: 24 },
      pollInterval: 60000,
    },
  );

  const [resolveError] = useMutation(RESOLVE_SYSTEM_ERROR, {
    onCompleted: () => refetch(),
  });

  const filteredErrors: SystemErrorData[] = React.useMemo(() => {
    if (!data?.getRecentSystemErrors) return [];
    const rawErrors = data.getRecentSystemErrors as SystemError[];
    let filtered = rawErrors.map(
      (error): SystemErrorData => ({
        id: error.id,
        source: error.source,
        errorType: error.errorType,
        severity: error.severity,
        errorMessage: error.errorMessage,
        component: error.component,
        action: error.action,
        occurrenceCount: error.occurrenceCount || 0,
        isResolved: error.isResolved,
        createdAt: error.createdAt,
        lastOccurredAt: error.lastOccurredAt,
        user: error.user,
        tenant: error.tenant,
      }),
    );

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (error) =>
          error.errorMessage.toLowerCase().includes(term) ||
          error.component?.toLowerCase().includes(term) ||
          error.user?.email?.toLowerCase().includes(term),
      );
    }
    return filtered;
  }, [data, filters.searchTerm]);

  const stats = React.useMemo(() => {
    if (!statsData?.getSystemErrorStats) return null;
    try {
      return JSON.parse(statsData.getSystemErrorStats);
    } catch {
      return null;
    }
  }, [statsData]);

  const handleResolveError = async (errorId: string) => {
    try {
      await resolveError({
        variables: {
          errorId,
          resolutionNotes: 'Resolved from admin dashboard',
        },
      });
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
        <p>
          {t.pages.admin.systemErrors.loadFailed.replace(
            '{message}',
            error.message,
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t.pages.admin.systemErrors.dashboardTitle}
          </h1>
          <p className="text-muted-foreground">
            {t.pages.admin.systemErrors.dashboardSubtitle}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.common.refresh}
        </Button>
      </div>

      <SystemErrorStatsCards stats={stats} loading={statsLoading} />

      <SystemErrorFilters
        searchTerm={filters.searchTerm}
        onSearchChange={(value) => updateFilters({ searchTerm: value })}
        selectedSeverity={filters.severity}
        onSeverityChange={(value) => updateFilters({ severity: value })}
        selectedSource={filters.source}
        onSourceChange={(value) => updateFilters({ source: value })}
        showResolved={filters.showResolved}
        onShowResolvedChange={(value) => updateFilters({ showResolved: value })}
      />

      <SystemErrorsList
        errors={filteredErrors}
        onResolveError={handleResolveError}
      />
    </div>
  );
}
