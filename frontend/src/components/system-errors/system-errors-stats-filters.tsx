'use client';

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
import { useI18n } from '@/i18n';
import { AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: { total: number; active: number; resolved: number; critical: number };
}

export function SystemErrorsStatsCards({ stats }: StatsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 text-sm font-medium break-words">
            {t.pages.admin.systemErrors.last24Hours}
          </CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-muted-foreground text-xs">
            {t.pages.admin.systemErrors.totalErrors}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="min-w-0 text-sm font-medium break-words">
            {t.pages.admin.systemErrors.activeErrors}
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          <p className="text-muted-foreground text-xs">
            {t.pages.admin.systemErrors.unresolvedIssues}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t.pages.admin.systemErrors.resolved}
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved}
          </div>
          <p className="text-muted-foreground text-xs">
            {t.pages.admin.systemErrors.fixedThisPeriod}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t.pages.admin.systemErrors.critical}
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.critical}
          </div>
          <p className="text-muted-foreground text-xs">
            {t.pages.admin.systemErrors.highPriorityIssues}
          </p>
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
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          {t.pages.admin.reports.severity}
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
            <SelectValue
              placeholder={t.pages.admin.systemErrors.allSeverities}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t.pages.admin.systemErrors.allSeverities}
            </SelectItem>
            <SelectItem value={ReportSeverity.Low}>
              {t.pages.admin.reports.severities.low}
            </SelectItem>
            <SelectItem value={ReportSeverity.Medium}>
              {t.pages.admin.reports.severities.medium}
            </SelectItem>
            <SelectItem value={ReportSeverity.High}>
              {t.pages.admin.reports.severities.high}
            </SelectItem>
            <SelectItem value={ReportSeverity.Critical}>
              {t.pages.admin.reports.severities.critical}
            </SelectItem>
            <SelectItem value={ReportSeverity.Urgent}>
              {t.pages.admin.reports.severities.urgent}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          {t.pages.admin.reports.source}
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
            <SelectValue placeholder={t.pages.admin.systemErrors.allSources} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t.pages.admin.systemErrors.allSources}
            </SelectItem>
            <SelectItem value={ErrorSource.Frontend}>
              {t.pages.admin.systemErrors.sourceLabels.frontend}
            </SelectItem>
            <SelectItem value={ErrorSource.Backend}>
              {t.pages.admin.systemErrors.sourceLabels.backend}
            </SelectItem>
            <SelectItem value={ErrorSource.Database}>
              {t.pages.admin.systemErrors.sourceLabels.database}
            </SelectItem>
            <SelectItem value={ErrorSource.ExternalApi}>
              {t.pages.admin.systemErrors.sourceLabels.externalApi}
            </SelectItem>
            <SelectItem value={ErrorSource.Infrastructure}>
              {t.pages.admin.systemErrors.sourceLabels.infrastructure}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-0">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
          {t.pages.admin.reports.status}
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
            <SelectValue placeholder={t.pages.admin.systemErrors.allStatuses} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t.pages.admin.systemErrors.allStatuses}
            </SelectItem>
            <SelectItem value="false">
              {t.pages.admin.systemErrors.active}
            </SelectItem>
            <SelectItem value="true">
              {t.pages.admin.reports.statuses.resolved}
            </SelectItem>
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
            {t.pages.admin.systemErrors.clearAll.replace(
              '{count}',
              String(activeFiltersCount),
            )}
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
