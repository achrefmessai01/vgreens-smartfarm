'use client';

import {
  CombinedGreenhouseView,
  FarmOverviewCard,
  FarmOverviewPageSkeleton,
  GreenhouseSelector,
  HistoryDrawer,
} from '@/components/farm-overview';
import { FeatureGuard } from '@/components/features/feature-guard';
import { PageHeader } from '@/components/layout/page-header';
import { TenantSelector } from '@/components/tenants';
import { useI18n } from '@/i18n';
import { useFarmOverviewPage } from '@/lib/hooks/use-farm-overview-page';
import { ParameterType } from '@/types/farm.types';

export default function FarmOverviewPage() {
  const { t } = useI18n();
  const farmOverviewT = t.pages.farmOverview as Parameters<
    typeof useFarmOverviewPage
  >[0];
  const state = useFarmOverviewPage(farmOverviewT);

  if (state.loading) {
    return (
      <FeatureGuard featureKey="farm_overview">
        <FarmOverviewPageSkeleton showTenantSelector={state.isVGreensAdmin} />
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-6 overflow-x-clip bg-background">
        <PageHeader
          title={t.pages.farmOverview.title}
          subtitle={t.pages.farmOverview.subtitle}
        />

        {state.isVGreensAdmin && (
          <TenantSelector
            tenants={state.tenants}
            selectedTenantId={state.tenantSelectorValue}
            onTenantChange={state.handleTenantChange}
            label={t.pages.admin.users.selectTenant || 'Select tenant'}
            placeholder={t.pages.admin.users.selectTenant}
          />
        )}

        <GreenhouseSelector
          value={state.activeGreenhouseTab}
          onValueChange={state.setActiveGreenhouseTab}
          options={state.greenhouseOptions}
        />

        <div className="flex flex-1 min-h-0 min-w-0 flex-col">
          {state.isCombinedView ? (
            <CombinedGreenhouseView
              greenhouses={state.combinedGreenhouses}
              parameters={state.parameterOptions}
              noDataMessage={state.labels.noData}
              parGraphGreenhouseId="greenhouse_01"
              parGraphLabel={state.labels.combined}
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
              bays={state.bays}
              greenhouseId={state.greenhouseId}
              greenhouseLabel={state.greenhouseLabel}
              selectedSlotId={state.selectedSlotId}
              onSelectSlot={state.setSelectedSlotId}
              parameterLabel={state.getParameterLabel(state.effectiveParameter)}
              noSensorLabel={state.labels.noSensor}
              noDataMessage={state.labels.noData}
              emptyForNowMessage={state.labels.emptyForNow}
            />
          )}
        </div>

        {!state.isCombinedView && (
          <HistoryDrawer
            open={state.historyDrawerOpen}
            onOpenChange={state.setHistoryDrawerOpen}
            parameter={state.effectiveParameter}
            slotId={state.selectedSlotId}
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
