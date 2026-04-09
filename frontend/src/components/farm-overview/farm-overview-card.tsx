'use client';

import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n/context';
import type { Bay, ParameterType } from '@/types/farm.types';
import type { FarmLayoutConfig, GreenhouseDimensions } from '@/lib/sensor-map-positions';
import type { SensorPositionCommit } from '@/types/sensor-map';
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
  farmLayout?: FarmLayoutConfig;
  greenhouseDimensions?: GreenhouseDimensions | null;
  onSensorPositionCommit: (
    payload: SensorPositionCommit,
  ) => Promise<void> | void;
  savingDeviceId?: string | null;
  positionErrorDeviceId?: string | null;
  invalidDropTitle?: string;
  invalidDropDescription?: string;
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
  farmLayout,
  greenhouseDimensions,
  onSensorPositionCommit,
  savingDeviceId,
  positionErrorDeviceId,
  invalidDropTitle,
  invalidDropDescription,
}: FarmOverviewCardProps) {
  const { t } = useI18n();

  entranceLabel = entranceLabel ?? t.pages.farmOverview.entranceLabel;

  const showEmpty = false;
  const showGraphOption =
    effectiveParameter === 'par' || effectiveParameter === 'par_estimated';

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-none py-0 dark:shadow-lg">
      <div className="bg-muted/10 flex shrink-0 flex-col">
        <div className="border-border/40 bg-background flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">
            <ParameterSelector
              value={effectiveParameter}
              onValueChange={onParameterChange}
              options={parameterOptions}
            />
          </div>
          {greenhouseDimensions && viewMode !== 'graph' && (
            <div className="text-muted-foreground hidden items-center gap-1 text-xs tabular-nums sm:flex">
              <span>{greenhouseDimensions.xDimension}m</span>
              <span className="opacity-50">×</span>
              <span>{greenhouseDimensions.yDimension}m</span>
            </div>
          )}
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

      <div className="bg-background dark:bg-background/50 flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {showEmpty ? (
            <EmptyState
              message={emptyForNowMessage}
              icon={<EmptyState.GreenhouseIcon />}
            />
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col">
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
                onSensorPositionCommit={onSensorPositionCommit}
                savingDeviceId={savingDeviceId}
                positionErrorDeviceId={positionErrorDeviceId}
                invalidDropTitle={invalidDropTitle}
                invalidDropDescription={invalidDropDescription}
                farmLayout={farmLayout}
                greenhouseDimensions={greenhouseDimensions}
              />
              {viewMode !== 'graph' && (
                <div
                  className="bg-secondary text-secondary-foreground absolute bottom-0 left-0 flex h-[5.75rem] w-4 items-center justify-center border shadow-sm sm:h-[12.5rem] sm:w-8"
                  aria-label={entranceLabel}
                >
                  <span
                    className="text-[7px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase sm:text-[12px] sm:tracking-[0.18em]"
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
