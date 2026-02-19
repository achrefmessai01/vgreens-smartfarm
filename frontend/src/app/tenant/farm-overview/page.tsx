'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import {
  HistoryDrawer,
  SingleBayView,
  SensorMapView,
  ParameterSelector,
} from '@/components/farm-overview'
import { useSearchParams } from 'next/navigation'
import { formatFieldToLabel } from '@/lib/farm-data'
import type { ParameterType } from '@/lib/farm-types'
import { PageHeader } from '@/components/layout/page-header'
import { StyledSelect } from '@/components/ui/styled-select'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data'
import { FeatureGuard } from '@/components/features/feature-guard'
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket'
import { useTenantsQuery, type Tenant, UserRole } from '@/generated/graphql'

const GREENHOUSE_LABEL_KEYS = ['greenHouse1', 'greenHouse2'] as const

export default function FarmOverviewPage() {
  const { t } = useI18n()
  const { role } = useCurrentUser()
  const isVGreensAdmin = role === UserRole.VgreensAdmin
  const searchParams = useSearchParams()
  const initialTenantIdFromUrl = searchParams.get('tenantId') ?? ''

  const { data: tenantsData } = useTenantsQuery({
    skip: !isVGreensAdmin,
    fetchPolicy: 'cache-first',
  })
  const tenants = React.useMemo(
    () => (tenantsData?.tenants || []) as Tenant[],
    [tenantsData?.tenants],
  )

  const [selectedTenantId, setSelectedTenantId] = React.useState<string>(
    initialTenantIdFromUrl,
  )

  React.useEffect(() => {
    if (!isVGreensAdmin || tenants.length === 0) return

    if (
      initialTenantIdFromUrl &&
      tenants.some((t) => t.id === initialTenantIdFromUrl)
    ) {
      setSelectedTenantId(initialTenantIdFromUrl)
      return
    }

    const currentIsValid =
      selectedTenantId && tenants.some((t) => t.id === selectedTenantId)
    if (!currentIsValid) {
      setSelectedTenantId(tenants[0].id)
    }
  }, [isVGreensAdmin, tenants, selectedTenantId, initialTenantIdFromUrl])

  const handleTenantChange = React.useCallback((value: string) => {
    setSelectedTenantId(value)
    if (typeof window !== 'undefined' && value) {
      const url = new URL(window.location.href)
      url.searchParams.set('tenantId', value)
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const { bucketName: selectedTenantBucketName } = useTenantBucketName(
    isVGreensAdmin ? selectedTenantId : undefined,
  )

  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined

  const { bays, bucketFields, loading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
  })
  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('temperature')

  const parameterOptions = React.useMemo(() => {
    if (bucketFields.length === 0) {
      return [{ label: t.pages.farmOverview.temperature, value: 'temperature' }]
    }

    const hasPar = bucketFields.includes('par')
    const hasParEstimated = bucketFields.includes('par_estimated')

    const baseFields = bucketFields.filter(
      (field) =>
        field !== 'lux' && field !== 'par' && field !== 'par_estimated',
    )

    const options = baseFields.map((field) => ({
      label: formatFieldToLabel(field),
      value: field,
    }))

    const parField: ParameterType | null = hasParEstimated
      ? 'par_estimated'
      : hasPar
        ? 'par'
        : null

    if (parField) {
      options.push({
        label: formatFieldToLabel('par'),
        value: parField,
      })
    }

    return options
  }, [bucketFields, t.pages.farmOverview.temperature])

  const effectiveParameter =
    selectedParameter && bucketFields.includes(selectedParameter)
      ? selectedParameter
      : (bucketFields[0] ?? 'temperature')

  React.useEffect(() => {
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0])
    }
  }, [bucketFields, selectedParameter])
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  )
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false)
  const [viewMode] = React.useState<'grid' | 'map'>('map')
  const [activeGreenhouseTab, setActiveGreenhouseTab] = React.useState(0)

  React.useEffect(() => {
    if (selectedSlotId) {
      setHistoryDrawerOpen(true)
    }
  }, [selectedSlotId])

  const getParameterLabel = (param: ParameterType): string =>
    formatFieldToLabel(param)

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="flex flex-col h-[calc(100vh-80px)] max-h-screen">
        <div className="flex-shrink-0 mb-1">
          <PageHeader title={t.pages.farmOverview.title} />
          {isVGreensAdmin && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {t.pages.admin.users.selectTenant || 'Select tenant'}:
              </span>
              <StyledSelect
                value={
                  selectedTenantId &&
                  tenants.some((t) => t.id === selectedTenantId)
                    ? selectedTenantId
                    : (tenants[0]?.id ?? '')
                }
                onValueChange={handleTenantChange}
                options={tenants.map((tenant) => ({
                  label: tenant.name,
                  value: tenant.id,
                }))}
                width="240px"
                triggerClassName="sm:w-[260px]"
                placeholder={t.pages.admin.users.selectTenant}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-muted/30 rounded-lg p-3">
            <div className="flex-shrink-0 flex border-b border-border mb-3">
              {GREENHOUSE_LABEL_KEYS.map((labelKey, index) => (
                <button
                  key={labelKey}
                  type="button"
                  onClick={() => setActiveGreenhouseTab(index)}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeGreenhouseTab === index
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  {t.pages.farmOverview[labelKey]}
                </button>
              ))}
            </div>
            <div className="flex-shrink-0 mb-2 space-y-2 flex flex-wrap items-center gap-3">
              {/* <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t.pages.farmOverview.viewGrid}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t.pages.farmOverview.viewMap}
                </button>
              </div> */}
              {/* <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium whitespace-nowrap">
                  {t.pages.farmOverview.dateRange}:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  aria-label={t.pages.farmOverview.fromDate}
                />
                <span className="text-muted-foreground text-sm">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  aria-label={t.pages.farmOverview.toDate}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyRange}
                  disabled={!dateFrom || !dateTo}
                >
                  {t.pages.farmOverview.apply}
                </Button>
                {appliedRange && daysInRange.length > 0 && (
                  <>
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                      {t.pages.farmOverview.viewByDay}:
                    </span>
                    <StyledSelect
                      value={selectedDay ?? '__all__'}
                      onValueChange={(val) =>
                        setSelectedDay(val === '__all__' ? null : val)
                      }
                      options={[
                        {
                          label: t.pages.farmOverview.allDays,
                          value: '__all__',
                        },
                        ...daysInRange.map((d) => ({
                          label: d,
                          value: d,
                        })),
                      ]}
                      width="140px"
                      triggerClassName="min-w-[140px]"
                    />
                  </>
                )}
              </div> */}
              <ParameterSelector
                value={effectiveParameter}
                onValueChange={setSelectedParameter}
                options={parameterOptions}
                selectParameterLabel={t.pages.farmOverview.selectParameter}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-4 rounded-lg bg-muted/20 p-6">
                  <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
                </div>
              ) : activeGreenhouseTab === 1 ? (
                <div className="h-full min-h-[200px] flex items-center justify-center rounded-lg bg-muted/20 text-muted-foreground text-sm">
                  {(t.pages.farmOverview as { emptyForNow?: string })
                    .emptyForNow ?? 'Empty for now'}
                </div>
              ) : bays.length > 0 ? (
                <div className="h-full min-h-0">
                  {viewMode === 'map' ? (
                    <SensorMapView
                      key={bays[0].id}
                      bay={bays[0]}
                      parameter={effectiveParameter}
                      selectedSlotId={selectedSlotId}
                      onSelectSlot={setSelectedSlotId}
                      bayLabel={t.pages.farmOverview.greenHouse1}
                      className="min-h-0 h-full"
                      showOnlyFilledPositions
                    />
                  ) : (
                    <SingleBayView
                      key={bays[0].id}
                      bay={bays[0]}
                      parameter={effectiveParameter}
                      selectedSlotId={selectedSlotId}
                      onSelectSlot={setSelectedSlotId}
                      bayLabel={t.pages.farmOverview.greenHouse1}
                      parameterLabel={getParameterLabel(effectiveParameter)}
                      noSensorLabel={t.pages.farmOverview.noSensor}
                      className="min-h-0 h-full"
                    />
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[200px] flex items-center justify-center rounded-lg bg-muted/20 text-muted-foreground text-sm">
                  {t.pages.farmOverview.noData}
                </div>
              )}
            </div>
          </div>
        </div>

        <HistoryDrawer
          open={historyDrawerOpen}
          onOpenChange={setHistoryDrawerOpen}
          parameter={effectiveParameter}
          slotId={selectedSlotId}
          parameterLabel={getParameterLabel(effectiveParameter)}
          timeRangeLabel={t.pages.farmOverview.timeRange}
          oneDayLabel={t.pages.farmOverview.oneDay}
          oneWeekLabel={t.pages.farmOverview.oneWeek}
          oneMonthLabel={t.pages.farmOverview.oneMonth}
          historyLabel={t.pages.farmOverview.history}
          bucketName={tenantBucketNameOverride ?? undefined}
        />
      </div>
    </FeatureGuard>
  )
}
