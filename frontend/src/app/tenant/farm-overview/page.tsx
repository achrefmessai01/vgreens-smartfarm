'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import {
  CalibrationDropdown,
  CombinedGreenhouseView,
  FarmOverviewCard,
  FarmOverviewPageSkeleton,
  GreenhouseSelector,
  HistoryDrawer,
  SensorVisibilityDropdown,
} from '@/components/farm-overview';
import { TimeRangeSelector } from '@/components/farm-overview/time-range-selector';
import { FeatureGuard } from '@/components/features/feature-guard';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { useFarmOverviewPage } from '@/lib/hooks/use-farm-overview-page';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { ParameterType } from '@/types/farm.types';

export default function FarmOverviewPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const farmOverviewT = t.pages.farmOverview as Parameters<
    typeof useFarmOverviewPage
  >[0];
  const state = useFarmOverviewPage(farmOverviewT);
  // vGreens-internal users (admin + read-only member) get a shortcut into the
  // tenant's farm-overview config tab. Tenant users don't see it — they
  // shouldn't be routed into the admin area at all. Hidden if no tenant is
  // in scope yet (member without a selected tenant) so we never link to
  // `/admin/tenants/?tab=farm-overview`.
  const { isVGreensAdmin, isVGreensMember } = useCurrentUser();
  const canAccessFarmConfig = isVGreensAdmin || isVGreensMember;
  const configTenantId = state.selectedTenantId || '';
  const farmOverviewH = t.pages.farmOverview as Record<
    string,
    string | undefined
  > &
    typeof t.pages.farmOverview;
  const openConfigLabel =
    farmOverviewH?.openConfigSettings ?? 'Open configuration settings';

  if (state.loading) {
    return (
      <FeatureGuard featureKey="farm_overview">
        <FarmOverviewPageSkeleton />
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard featureKey="farm_overview">
      <div
        className={
          isMobile
            ? 'bg-background flex h-[calc(100vh-8rem)] min-h-0 w-full min-w-0 flex-col gap-6 overflow-x-clip'
            : 'bg-background flex h-full min-h-0 w-full min-w-0 flex-col gap-6 overflow-x-clip'
        }
      >
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title={t.pages.farmOverview.title}
            subtitle={t.pages.farmOverview.subtitle}
            className="mb-0"
          />
          <div className="flex shrink-0 items-end gap-2">
            {state.isCombinedView && <TimeRangeSelector />}
            {state.canEditSensorPositions && (
              <SensorVisibilityDropdown
                disabledFields={state.disabledSensorFields}
                onToggle={state.handleToggleSensorField}
                saving={state.savingSensorFields}
                triggerLabel={t.pages.farmOverview.enableSensors}
                showAllLabel={t.pages.farmOverview.showAllSensors}
                hideAllLabel={t.pages.farmOverview.hideAllSensors}
                visibleSuffixLabel={t.pages.farmOverview.sensorsVisible}
                overviewLabel={t.pages.farmOverview.enableSensorOverview}
              />
            )}
            {/* Admin-only: soil-sensor calibration by irrigation cycle.
                Server enforces the same role on the cycles query and the
                capture mutations. */}
            {state.canEditSensorPositions && (
              <CalibrationDropdown
                cycles={state.irrigationCycles}
                tenantId={state.calibrationTenantId}
                onCalibrated={() => {
                  // Refresh both: bounds live on sensor_configs (drives the
                  // map's corrected values), the sidebar rows on the cycle.
                  void state.refetchSoilSensorConfigs();
                  void state.refetchIrrigationCycles();
                }}
              />
            )}
            {/* Tenant switching lives exclusively in the sidebar
                (`SidebarTenantCard`) now; the page-level dropdown that used
                to sit here was removed in favor of the shared
                `SelectedTenantProvider` context. */}
            {/* vGreens-internal shortcut into the tenant's farm-overview
                config tab (SensorVisibility + FarmLayout + SensorConfig).
                The deep link uses `?tab=farm-overview` which TenantDetailsTabs
                reads to preselect the tab. */}
            {canAccessFarmConfig && configTenantId && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-lg"
                aria-label={openConfigLabel}
                title={openConfigLabel}
              >
                <Link
                  href={`/admin/tenants/${configTenantId}?tab=farm-overview`}
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <GreenhouseSelector
          value={state.activeGreenhouseTab}
          onValueChange={state.setActiveGreenhouseTab}
          options={state.greenhouseOptions}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {state.isCombinedView ? (
            <CombinedGreenhouseView
              greenhouses={state.combinedGreenhouses}
              parameters={state.parameterOptions}
              noDataMessage={state.labels.noData}
              parGraphLabel={state.labels.combined}
              parGraphBucketName={state.tenantBucketNameOverride}
              parGraphTenantId={state.tenantIdOverride}
              onParameterClick={(greenhouseIndex, parameterKey) => {
                state.setActiveGreenhouseTab(greenhouseIndex + 1);
                state.setSelectedParameter(parameterKey as ParameterType);
              }}
            />
          ) : (
            <FarmOverviewCard
              parameterOptions={state.parameterOptions}
              effectiveParameter={state.effectiveParameter}
              onParameterChange={state.setSelectedParameter}
              viewMode={state.viewMode}
              onViewModeChange={state.setViewMode}
              viewHeatmapLabel={state.labels.viewHeatmap}
              viewDiscreteLabel={state.labels.viewDiscrete}
              viewGraphLabel={state.labels.viewGraph}
              overviewEnabled={state.overviewEnabled}
              disabledSensorFields={state.disabledSensorFields}
              bays={state.bays}
              overviewConfiguredSensors={state.overviewConfiguredSensors}
              greenhouseLabel={state.greenhouseLabel}
              parGraphTenantId={state.tenantIdOverride}
              parGraphGreenhouseName={state.greenhouseLabel}
              selectedSlotId={state.selectedSlotId}
              onSelectSlot={state.setSelectedSlotId}
              parameterLabel={state.getParameterLabel(state.effectiveParameter)}
              noSensorLabel={state.labels.noSensor}
              noDataMessage={state.labels.noData}
              emptyForNowMessage={state.labels.emptyForNow}
              onSensorPositionCommit={state.handleSensorPositionCommit}
              savingDeviceId={state.savingDeviceId}
              positionErrorDeviceId={state.positionErrorDeviceId}
              invalidDropTitle={state.labels.invalidDropTitle}
              invalidDropDescription={state.labels.invalidDropDescription}
              farmLayout={state.farmLayout}
              greenhouseDimensions={state.greenhouseDimensions}
              readOnly={!state.canEditSensorPositions}
            />
          )}
        </div>

        {!state.isCombinedView && (
          <HistoryDrawer
            open={state.historyDrawerOpen}
            onOpenChange={state.setHistoryDrawerOpen}
            parameter={state.effectiveParameter}
            slotId={state.selectedSlotId}
            greenhouse={state.selectedSlotGreenhouse}
            parameterLabel={state.getParameterLabel(state.effectiveParameter)}
            timeRangeLabel={t.pages.farmOverview.timeRange}
            oneDayLabel={t.pages.farmOverview.oneDay}
            oneWeekLabel={t.pages.farmOverview.oneWeek}
            oneMonthLabel={t.pages.farmOverview.oneMonth}
            historyLabel={t.pages.farmOverview.history}
            bucketName={state.tenantBucketNameOverride ?? undefined}
          />
        )}
      </div>
    </FeatureGuard>
  );
}
