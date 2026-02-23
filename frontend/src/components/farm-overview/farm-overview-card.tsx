'use client'

import { Card } from '@/components/ui/card'
import { useI18n } from '@/i18n/context'
import type { Bay, ParameterType } from '@/lib/farm-types'
import { EmptyState } from './empty-state'
import { FarmDataDisplay } from './farm-view-container'
import { GreenhouseSelector } from './greenhouse-selector'
import { ParameterColorLegendBar } from './parameter-color-legend'
import { ParameterSelector } from './parameter-selector'
import { ViewModeSelector } from './view-mode-selector'

export interface FarmOverviewCardProps {
  greenhouseOptions: { key: string; label: string }[]
  activeGreenhouseTab: number
  onGreenhouseChange: (index: number) => void
  parameterOptions: { label: string; value: string }[]
  effectiveParameter: ParameterType
  onParameterChange: (value: ParameterType) => void
  viewMode: 'heatmap' | 'discrete'
  onViewModeChange: (value: 'heatmap' | 'discrete') => void
  viewHeatmapLabel: string
  viewDiscreteLabel: string
  bays: Bay[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string | null) => void
  parameterLabel: string
  noSensorLabel: string
  noDataMessage: string
  emptyForNowMessage: string
  entranceLabel?: string
}

export function FarmOverviewCard({
  greenhouseOptions,
  activeGreenhouseTab,
  onGreenhouseChange,
  parameterOptions,
  effectiveParameter,
  onParameterChange,
  viewMode,
  onViewModeChange,
  viewHeatmapLabel,
  viewDiscreteLabel,
  bays,
  selectedSlotId,
  onSelectSlot,
  parameterLabel,
  noSensorLabel,
  noDataMessage,
  emptyForNowMessage,
  entranceLabel,
}: FarmOverviewCardProps) {
  const { t } = useI18n();
  
  entranceLabel = entranceLabel ?? t.pages.farmOverview.entranceLabel;

  const showEmpty = activeGreenhouseTab === 1

  return (
    <Card className="h-full min-h-0 flex flex-col gap-0 py-0 overflow-hidden dark:shadow-lg">
      <div className="shrink-0 flex flex-col bg-muted/10">
        <div className="px-4">
          <GreenhouseSelector
            value={activeGreenhouseTab}
            onValueChange={onGreenhouseChange}
            options={greenhouseOptions}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-1 border-b border-border/40 bg-background">
          <ParameterSelector
            value={effectiveParameter}
            onValueChange={onParameterChange}
            options={parameterOptions}
          />
          <ViewModeSelector
            value={viewMode}
            onValueChange={onViewModeChange}
            heatmapLabel={viewHeatmapLabel}
            discreteLabel={viewDiscreteLabel}
          />
        </div>
        {!showEmpty && (
          <ParameterColorLegendBar parameter={effectiveParameter} />
        )}
      </div>

      <div className="flex-1 min-h-0 flex bg-background dark:bg-background/50">
        <div className="flex flex-1 min-w-0 overflow-auto">
          {showEmpty ? (
            <EmptyState
              message={emptyForNowMessage}
              icon={<EmptyState.GreenhouseIcon />}
            />
          ) : (
            <div className="relative flex flex-1 flex-col min-h-0">
              <FarmDataDisplay
                bays={bays}
                viewMode={viewMode}
                parameter={effectiveParameter}
                selectedSlotId={selectedSlotId}
                onSelectSlot={onSelectSlot}
                bayLabel={parameterLabel}
                parameterLabel={parameterLabel}
                noSensorLabel={noSensorLabel}
                noDataMessage={noDataMessage}
              />
              <div
                className="absolute bottom-0 left-0 w-10 h-[5.5rem] flex items-center justify-center bg-secondary text-secondary-foreground border-r border-t border-border rounded-tr-md"
                aria-label={entranceLabel}
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {entranceLabel}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
