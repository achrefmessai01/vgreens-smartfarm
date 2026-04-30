import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorSource, ReportSeverity } from '@/generated/graphql';
import { AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: { total: number; active: number; resolved: number; critical: number };
}

export function SystemErrorsStatsCards({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 text-sm font-medium break-words">
            Last 24 Hours
          </CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-muted-foreground text-xs">Total errors</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 text-sm font-medium break-words">
            Active Errors
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          <p className="text-muted-foreground text-xs">Unresolved issues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved}
          </div>
          <p className="text-muted-foreground text-xs">Fixed this period</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.critical}
          </div>
          <p className="text-muted-foreground text-xs">High priority issues</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface FiltersProps {
  severityFilter: ReportSeverity | undefined;
  sourceFilter: ErrorSource | undefined;
  resolvedFilter: boolean | undefined;
  setSeverityFilter: (value: ReportSeverity | undefined) => void;
  setSourceFilter: (value: ErrorSource | undefined) => void;
  setResolvedFilter: (value: boolean | undefined) => void;
  handleRefresh: () => void;
  clearFilters: () => void;
  loading: boolean;
  activeFiltersCount: number;
}

export function SystemErrorsFilters({
  severityFilter,
  sourceFilter,
  resolvedFilter,
  setSeverityFilter,
  setSourceFilter,
  setResolvedFilter,
  handleRefresh,
  clearFilters,
  loading,
  activeFiltersCount,
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          Severity
        </label>
        <Select
          value={severityFilter ?? 'all'}
          onValueChange={(value) =>
            setSeverityFilter(
              value === 'all' ? undefined : (value as ReportSeverity),
            )
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value={ReportSeverity.Low}>Low</SelectItem>
            <SelectItem value={ReportSeverity.Medium}>Medium</SelectItem>
            <SelectItem value={ReportSeverity.High}>High</SelectItem>
            <SelectItem value={ReportSeverity.Critical}>Critical</SelectItem>
            <SelectItem value={ReportSeverity.Urgent}>Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          Source
        </label>
        <Select
          value={sourceFilter ?? 'all'}
          onValueChange={(value) =>
            setSourceFilter(
              value === 'all' ? undefined : (value as ErrorSource),
            )
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
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
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          Status
        </label>
        <Select
          value={
            resolvedFilter !== undefined ? resolvedFilter.toString() : 'all'
          }
          onValueChange={(value) =>
            setResolvedFilter(
              value === 'all' ? undefined : value === 'true' ? true : false,
            )
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:flex-wrap sm:items-center lg:col-span-1 lg:justify-end">
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 w-full sm:w-auto"
          >
            Clear All ({activeFiltersCount})
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-9 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
