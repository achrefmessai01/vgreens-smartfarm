'use client'

import { useI18n } from '@/i18n'
import {
  HistoryDrawer,
  FarmOverviewCard,
  FarmOverviewPageSkeleton,
} from '@/components/farm-overview'
import { TenantSelector } from '@/components/tenants'
import { PageHeader } from '@/components/layout/page-header'
import { useFarmOverviewPage } from './use-farm-overview-page'
import { FeatureGuard } from '@/components/features/feature-guard'

export default function FarmOverviewPage() {
  const { t } = useI18n()
  const farmOverviewT = t.pages.farmOverview as Parameters<
    typeof useFarmOverviewPage
  >[0]
  const state = useFarmOverviewPage(farmOverviewT)

  if (state.loading) {
    return (
      <FeatureGuard featureKey="farm_overview">
        <FarmOverviewPageSkeleton showTenantSelector={state.isVGreensAdmin} />
      </FeatureGuard>
    )
  }

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="flex flex-col h-full min-h-0 gap-6 bg-background">
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

        <div className="flex flex-1 flex-col min-h-0">
          <FarmOverviewCard
            greenhouseOptions={state.greenhouseOptions}
            activeGreenhouseTab={state.activeGreenhouseTab}
            onGreenhouseChange={state.setActiveGreenhouseTab}
            parameterOptions={state.parameterOptions}
            effectiveParameter={state.effectiveParameter}
            onParameterChange={state.setSelectedParameter}
            viewMode={state.viewMode}
            onViewModeChange={state.setViewMode}
            viewHeatmapLabel={state.labels.viewHeatmap}
            viewDiscreteLabel={state.labels.viewDiscrete}
            bays={state.bays}
            selectedSlotId={state.selectedSlotId}
            onSelectSlot={state.setSelectedSlotId}
            parameterLabel={state.getParameterLabel(state.effectiveParameter)}
            noSensorLabel={state.labels.noSensor}
            noDataMessage={state.labels.noData}
            emptyForNowMessage={state.labels.emptyForNow}
          />
        </div>

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
      </div>
    </FeatureGuard>
  )
}
