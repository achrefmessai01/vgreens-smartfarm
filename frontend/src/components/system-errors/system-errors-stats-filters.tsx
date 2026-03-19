import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';
import { ReportSeverity, ErrorSource } from '@/generated/graphql';

interface StatsProps {
  stats: { total: number; active: number; resolved: number; critical: number };
}

export function SystemErrorsStatsCards({ stats }: StatsProps) {
  return (
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
          <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          <p className="text-xs text-muted-foreground">Unresolved issues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <p className="text-xs text-muted-foreground">Fixed this period</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
          <p className="text-xs text-muted-foreground">High priority issues</p>
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
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
              value={severityFilter ?? 'all'}
              onValueChange={(value) =>
                setSeverityFilter(value === 'all' ? undefined : (value as ReportSeverity))
              }
            >
              <SelectTrigger>
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
          <div>
            <label className="text-sm font-medium mb-2 block">Source</label>
            <Select
              value={sourceFilter ?? 'all'}
              onValueChange={(value) =>
                setSourceFilter(value === 'all' ? undefined : (value as ErrorSource))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value={ErrorSource.Frontend}>Frontend</SelectItem>
                <SelectItem value={ErrorSource.Backend}>Backend</SelectItem>
                <SelectItem value={ErrorSource.Database}>Database</SelectItem>
                <SelectItem value={ErrorSource.ExternalApi}>External API</SelectItem>
                <SelectItem value={ErrorSource.Infrastructure}>Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={resolvedFilter !== undefined ? resolvedFilter.toString() : 'all'}
              onValueChange={(value) =>
                setResolvedFilter(
                  value === 'all' ? undefined : value === 'true' ? true : false,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="false">Active</SelectItem>
                <SelectItem value="true">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
