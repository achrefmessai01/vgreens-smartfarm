'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import {
  HistoryDrawer,
  ParameterSelector,
  SingleBayView,
} from '@/components/farm-overview'
import type { ParameterType } from '@/lib/farm-types'
import { formatFieldToLabel } from '@/lib/farm-data'
import { PageHeader } from '@/components/layout/page-header'
import { FeatureGuard } from '@/components/features/feature-guard'
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'

type GreenhouseTab = 'greenhouse1' | 'greenhouse2'

function getDaysInRange(from: string, to: string): string[] {
  const days: string[] = []
  const start = new Date(from)
  const end = new Date(to)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return days
  }
  const d = new Date(start)
  d.setUTCHours(0, 0, 0, 0)
  const e = new Date(end)
  e.setUTCHours(0, 0, 0, 0)
  while (d <= e) {
    days.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return days
}

export default function FarmOverviewPage() {
  const { t } = useI18n()
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [appliedRange, setAppliedRange] = React.useState<{ dateFrom: string; dateTo: string } | null>(null)
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null)

  const range = React.useMemo(() => {
    if (selectedDay) return { selectedDay }
    if (appliedRange) return { dateFrom: appliedRange.dateFrom, dateTo: appliedRange.dateTo }
    return undefined
  }, [appliedRange, selectedDay])

  const { bays, bucketFields, loading } = useLiveFarmData(range)
  const [activeTab, setActiveTab] = React.useState<GreenhouseTab>('greenhouse1')
  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('temperature')

  const parameterOptions = React.useMemo(
    () =>
      bucketFields.length > 0
        ? bucketFields.map((field) => ({
            label: formatFieldToLabel(field),
            value: field,
          }))
        : [{ label: t.pages.farmOverview.temperature, value: 'temperature' }],
    [bucketFields, t.pages.farmOverview.temperature]
  )

  const effectiveParameter =
    selectedParameter && bucketFields.includes(selectedParameter)
      ? selectedParameter
      : bucketFields[0] ?? 'temperature'

  React.useEffect(() => {
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0])
    }
  }, [bucketFields, selectedParameter])
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null
  )
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false)

  const daysInRange = React.useMemo(() => {
    if (!appliedRange) return []
    return getDaysInRange(appliedRange.dateFrom, appliedRange.dateTo)
  }, [appliedRange])

  const handleApplyRange = () => {
    if (dateFrom && dateTo) {
      setAppliedRange({ dateFrom, dateTo })
      setSelectedDay(null)
    }
  }

  const bay = activeTab === 'greenhouse1' ? bays[0] : bays[1]
  const bayLabel =
    activeTab === 'greenhouse1'
      ? t.pages.farmOverview.greenHouse1
      : t.pages.farmOverview.greenHouse2

  React.useEffect(() => {
    if (selectedSlotId) {
      setHistoryDrawerOpen(true)
    }
  }, [selectedSlotId])

  const getParameterLabel = (param: ParameterType): string =>
    formatFieldToLabel(param)

  const tabs: { id: GreenhouseTab; labelKey: 'greenHouse1' | 'greenHouse2' }[] =
    [
      { id: 'greenhouse1', labelKey: 'greenHouse1' },
      { id: 'greenhouse2', labelKey: 'greenHouse2' },
    ]

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="flex flex-col h-[calc(100vh-80px)] max-h-screen">
        <div className="flex-shrink-0 mb-1">
          <PageHeader title={t.pages.farmOverview.title} />
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-shrink-0 flex border-b border-border mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                )}
              >
                {t.pages.farmOverview[tab.labelKey]}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-muted/30 rounded-lg p-3">
            <div className="flex-shrink-0 mb-2 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
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
                        { label: t.pages.farmOverview.allDays, value: '__all__' },
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
              </div>
              <ParameterSelector
                value={effectiveParameter}
                onValueChange={setSelectedParameter}
                options={parameterOptions}
                selectParameterLabel={t.pages.farmOverview.selectParameter}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center rounded-lg bg-muted/20 text-muted-foreground text-sm">
                  {t.pages.farmOverview.loading}
                </div>
              ) : bay ? (
                <SingleBayView
                  bay={bay}
                  parameter={effectiveParameter}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={setSelectedSlotId}
                  bayLabel={bayLabel}
                  parameterLabel={getParameterLabel(effectiveParameter)}
                  noSensorLabel={t.pages.farmOverview.noSensor}
                  className="h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center rounded-lg bg-muted/20 text-muted-foreground text-sm">
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
        />
      </div>
    </FeatureGuard>
  )
}
