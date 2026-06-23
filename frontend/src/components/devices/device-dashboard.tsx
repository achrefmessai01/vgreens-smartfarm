'use client';

import * as React from 'react';
import { Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StyledSelect } from '@/components/ui/styled-select';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureNotAvailableCard } from '@/components/ui/feature-not-available-card';
import { useI18n } from '@/i18n';
import { useDeviceDashboard } from '@/lib/hooks/use-device-dashboard';
import { DeviceTimeFilter } from './device-time-filter';
import { DeviceGroupFilter } from './device-group-filter';
import { DeviceRefreshControl } from './device-refresh-control';
import { DeviceStatusSummary } from './device-status-summary';
import { DeviceActivityChart } from './device-activity-chart';
import { DeviceCharts } from './device-charts';
import { DeviceTable } from './device-table';

export function DeviceDashboard() {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;
  const {
    range,
    setRange,
    devices,
    statusCounts,
    totalDevices,
    totalRealDataPoints,
    activitySeries,
    isVGreensAdmin,
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    deviceGroups,
    groupFilter,
    setGroupFilter,
    customRange,
    setCustomRange,
    featureEnabled,
    featureChecked,
    refreshIntervalMs,
    setRefreshIntervalMs,
    refetch,
    loading,
  } = useDeviceDashboard();

  // For vGreens admins the picked tenant may not have the feature enabled.
  const featureUnavailable =
    isVGreensAdmin && !!selectedTenantId && featureChecked && !featureEnabled;
  const showInitialSkeleton =
    !featureUnavailable && loading && totalDevices === 0;

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-6 overflow-x-hidden">
      <PageHeader
        title={ds.title}
        subtitle={ds.subtitle}
        className="mb-0"
        actions={
          <div className="flex flex-wrap items-end justify-end gap-2">
            {isVGreensAdmin && tenants.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Building2 className="h-3 w-3" />
                  {ds.selectTenant}
                </span>
                <StyledSelect
                  value={selectedTenantId}
                  onValueChange={setSelectedTenantId}
                  options={tenants.map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                  triggerClassName="h-9 w-[200px] font-medium"
                  placeholder={ds.selectTenantPlaceholder}
                />
              </div>
            )}
            {!featureUnavailable && deviceGroups.length > 0 && (
              <DeviceGroupFilter
                groups={deviceGroups}
                value={groupFilter}
                onChange={setGroupFilter}
              />
            )}
            <DeviceTimeFilter
              range={range}
              onRangeChange={setRange}
              customRange={customRange}
              onCustomApply={setCustomRange}
              onCustomClear={() => setCustomRange(null)}
            />
            {!featureUnavailable && (
              <DeviceRefreshControl
                intervalMs={refreshIntervalMs}
                onIntervalChange={setRefreshIntervalMs}
                onReload={refetch}
                loading={loading}
              />
            )}
          </div>
        }
      />

      {featureUnavailable ? (
        <FeatureNotAvailableCard />
      ) : showInitialSkeleton ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-6 pb-2">
          <DeviceStatusSummary
            devices={devices}
            statusCounts={statusCounts}
            totalDevices={totalDevices}
            totalRealDataPoints={totalRealDataPoints}
          />
          <DeviceActivityChart data={activitySeries} />
          <DeviceCharts devices={devices} />
          <DeviceTable devices={devices} isLoading={loading} />
        </div>
      )}
    </div>
  );
}
