'use client';

import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n/context';
import type { Bay, ParameterType } from '@/lib/farm-types';
import { EmptyState } from './empty-state';
import { FarmDataDisplay } from './farm-view-container';
import { ParameterColorLegendBar } from './parameter-color-legend';
import { ParameterSelector } from './parameter-selector';
import { ViewModeSelector } from './view-mode-selector';

export interface FarmOverviewCardProps {
  parameterOptions: { label: string; value: string }[];
  effectiveParameter: ParameterType;
  onParameterChange: (value: ParameterType) => void;
  viewMode: 'heatmap' | 'discrete' | 'graph';
  onViewModeChange: (value: 'heatmap' | 'discrete' | 'graph') => void;
  viewHeatmapLabel: string;
  viewDiscreteLabel: string;
  viewGraphLabel: string;
  bays: Bay[];
  greenhouseId: string;
  greenhouseLabel: string;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  parameterLabel: string;
  noSensorLabel: string;
  noDataMessage: string;
  emptyForNowMessage: string;
  entranceLabel?: string;
}

export function FarmOverviewCard({
  parameterOptions,
  effectiveParameter,
  onParameterChange,
  viewMode,
  onViewModeChange,
  viewHeatmapLabel,
  viewDiscreteLabel,
  viewGraphLabel,
  bays,
  greenhouseId,
  greenhouseLabel,
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

  const showEmpty = false;
  const showGraphOption =
    effectiveParameter === 'par' || effectiveParameter === 'par_estimated';

  return (
    <Card className="h-full min-h-0 flex flex-col gap-0 py-0 overflow-hidden dark:shadow-lg rounded-none">
      <div className="shrink-0 flex flex-col bg-muted/10">
        <div className="flex flex-col gap-3 border-b border-border/40 bg-background px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">
            <ParameterSelector
              value={effectiveParameter}
              onValueChange={onParameterChange}
              options={parameterOptions}
            />
          </div>
          <div className="w-full min-w-0 sm:w-auto sm:flex-none">
            <ViewModeSelector
              value={viewMode}
              onValueChange={onViewModeChange}
              heatmapLabel={viewHeatmapLabel}
              discreteLabel={viewDiscreteLabel}
              graphLabel={viewGraphLabel}
              showGraphOption={showGraphOption}
            />
          </div>
        </div>
        {!showEmpty && viewMode !== 'graph' && (
          <ParameterColorLegendBar parameter={effectiveParameter} />
        )}
      </div>

      <div className="flex-1 min-h-0 flex bg-background dark:bg-background/50">
        <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
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
                greenhouseId={greenhouseId}
                greenhouseLabel={greenhouseLabel}
                selectedSlotId={selectedSlotId}
                onSelectSlot={onSelectSlot}
                parameterLabel={parameterLabel}
                noSensorLabel={noSensorLabel}
                noDataMessage={noDataMessage}
              />
              {viewMode !== 'graph' && (
                <div
                  className="absolute bottom-0 left-0 flex h-[5.75rem] w-4 items-center justify-center border bg-secondary text-secondary-foreground shadow-sm sm:h-[12.5rem] sm:w-8"
                  aria-label={entranceLabel}
                >
                  <span
                    className="whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.08em] sm:text-[12px] sm:tracking-[0.18em]"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {entranceLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
