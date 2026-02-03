'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import {
  HistoryDrawer,
  ParameterSelector,
  SingleBayView,
} from '@/components/farm-overview'
import { generateFarm } from '@/lib/farm-data'
import type { ParameterType } from '@/lib/farm-types'
import { PageHeader } from '@/components/layout/page-header'
import { FeatureGuard } from '@/components/features/feature-guard'
import { cn } from '@/lib/utils'

type GreenhouseTab = 'greenhouse1' | 'greenhouse2'

export default function FarmOverviewPage() {
  const { t } = useI18n()
  const [farm] = React.useState(() => generateFarm())
  const [activeTab, setActiveTab] = React.useState<GreenhouseTab>('greenhouse1')
  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('humidity')
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null
  )
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false)

  const bay = activeTab === 'greenhouse1' ? farm.bays[0] : farm.bays[1]
  const bayLabel =
    activeTab === 'greenhouse1'
      ? t.pages.farmOverview.greenHouse1
      : t.pages.farmOverview.greenHouse2

  React.useEffect(() => {
    if (selectedSlotId) {
      setHistoryDrawerOpen(true)
    }
  }, [selectedSlotId])

  const getParameterLabel = (param: ParameterType): string => {
    switch (param) {
      case 'fruitLoad':
        return t.pages.farmOverview.fruitLoad
      case 'canopyCover':
        return t.pages.farmOverview.canopyCover
      case 'energyBalance':
        return t.pages.farmOverview.energyBalance
      case 'temperature':
        return t.pages.farmOverview.temperature
      case 'humidity':
        return t.pages.farmOverview.humidity
      default:
        return ''
    }
  }

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
            <div className="flex-shrink-0 mb-2">
              <ParameterSelector
                value={selectedParameter}
                onValueChange={setSelectedParameter}
                fruitLoadLabel={t.pages.farmOverview.fruitLoad}
                canopyCoverLabel={t.pages.farmOverview.canopyCover}
                energyBalanceLabel={t.pages.farmOverview.energyBalance}
                temperatureLabel={t.pages.farmOverview.temperature}
                humidityLabel={t.pages.farmOverview.humidity}
                selectParameterLabel={t.pages.farmOverview.selectParameter}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {bay && (
                <SingleBayView
                  bay={bay}
                  parameter={selectedParameter}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={setSelectedSlotId}
                  bayLabel={bayLabel}
                  parameterLabel={getParameterLabel(selectedParameter)}
                  noSensorLabel={t.pages.farmOverview.noSensor}
                  className="h-full"
                />
              )}
            </div>
          </div>
        </div>

        <HistoryDrawer
          open={historyDrawerOpen}
          onOpenChange={setHistoryDrawerOpen}
          parameter={selectedParameter}
          slotId={selectedSlotId}
          parameterLabel={getParameterLabel(selectedParameter)}
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
