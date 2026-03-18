import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { useState } from 'react';
import {
  useSystemErrors,
  useSystemErrorStats,
  useResolveSystemError,
} from '@/lib/hooks/use-system-errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { SystemErrorsTable } from '@/components/system-errors';
import { SystemErrorDetailsDialog } from '@/components/system-errors';
import { SystemError, ReportSeverity, ErrorSource } from '@/generated/graphql';
import { AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SystemErrorsDashboard() {
  const { t } = useI18n();
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<
    ReportSeverity | undefined
  >();
  const [sourceFilter, setSourceFilter] = useState<ErrorSource | undefined>();
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>();

  const { data, loading, refetch } = useSystemErrors({
    severity: severityFilter,
    source: sourceFilter,
    isResolved: resolvedFilter,
    limit: 100,
  });
  const { data: statsData } = useSystemErrorStats(24);
  const [resolveError, { loading: isResolving }] = useResolveSystemError();
  const errors = data?.getRecentSystemErrors || [];

  let stats = { total: 0, active: 0, resolved: 0, critical: 0 };
  try {
    if (statsData?.getSystemErrorStats) {
      stats = JSON.parse(statsData.getSystemErrorStats);
    }
  } catch (e) {
    console.error('Failed to parse error stats:', e);
  }

  const handleResolveError = async (
    errorId: string,
    resolutionNotes?: string,
  ) => {
    try {
      await resolveError({ variables: { errorId, resolutionNotes } });
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="System Error History"
        subtitle="Monitor and manage application errors and exceptions"
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Unresolved issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <p className="text-xs text-muted-foreground">Fixed this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All ({activeFiltersCount})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select
                value={severityFilter ?? ''}
                onValueChange={(value) =>
                  setSeverityFilter((value as ReportSeverity) || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All severities</SelectItem>
                  <SelectItem value={ReportSeverity.Low}>Low</SelectItem>
                  <SelectItem value={ReportSeverity.Medium}>Medium</SelectItem>
                  <SelectItem value={ReportSeverity.High}>High</SelectItem>
                  <SelectItem value={ReportSeverity.Critical}>
                    Critical
                  </SelectItem>
                  <SelectItem value={ReportSeverity.Urgent}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select
                value={sourceFilter ?? ''}
                onValueChange={(value) =>
                  setSourceFilter((value as ErrorSource) || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sources</SelectItem>
                  <SelectItem value={ErrorSource.Frontend}>Frontend</SelectItem>
                  <SelectItem value={ErrorSource.Backend}>Backend</SelectItem>
                  <SelectItem value={ErrorSource.Database}>Database</SelectItem>
                  <SelectItem value={ErrorSource.ExternalApi}>
                    External API
                  </SelectItem>
                  <SelectItem value={ErrorSource.Infrastructure}>
                    Infrastructure
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={resolvedFilter?.toString() ?? ''}
                onValueChange={(value) =>
                  setResolvedFilter(
                    value === 'true'
                      ? true
                      : value === 'false'
                        ? false
                        : undefined,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Error History
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {/* <span>Showing {errors.length} errors</span> */}
              {activeFiltersCount > 0 && (
                <Badge variant="outline">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}{' '}
                  active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SystemErrorsTable
            errors={errors}
            isLoading={loading}
            onResolve={(error) => handleResolveError(error.id)}
            onViewDetails={handleViewDetails}
            isResolving={isResolving}
          />
        </CardContent>
      </Card>
      {/* Details Dialog */}
      <SystemErrorDetailsDialog
        error={selectedError}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedError(null);
        }}
        onResolve={handleResolveError}
        isResolving={isResolving}
      />
    </div>
  );
}
