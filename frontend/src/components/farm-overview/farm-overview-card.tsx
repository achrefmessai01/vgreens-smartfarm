'use client';

import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n/context';
import {
  SENSOR_OVERVIEW_PARAMETER,
  type ViewMode,
} from '@/lib/farm-overview-constants';
import type {
  FarmLayoutConfig,
  GreenhouseDimensions,
} from '@/lib/sensor-map-positions';
import type { Bay, ParameterType } from '@/types/farm.types';
import type { SensorPositionCommit } from '@/types/sensor-map';
import { EmptyState } from './empty-state';
import { EntranceLabel } from './entrance-label';
import { FarmDataDisplay } from './farm-view-container';
import { ParameterColorLegendBar } from './parameter-color-legend';
import { ParameterSelector } from './parameter-selector';
import { ViewModeSelector } from './view-mode-selector';

export interface FarmOverviewCardProps {
  parameterOptions: { label: string; value: string }[];
  effectiveParameter: ParameterType;
  onParameterChange: (value: ParameterType) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  viewHeatmapLabel: string;
  viewDiscreteLabel: string;
  viewGraphLabel: string;
  /** Whether the "Overview" parameter tab (all-sensors map) is enabled. */
  overviewEnabled: boolean;
  /** Disabled sensor `_field` set ("Enable Sensors" dropdown). */
  disabledSensorFields: Set<string>;
  bays: Bay[];
  greenhouseLabel: string;
  /** Optional tenant override forwarded to the embedded PAR graph.
   *  Required for vGreens admins viewing another tenant. */
  parGraphTenantId?: string | null;
  /** Greenhouse name passed through to the PAR graph for tenant-aware
   *  slicing. Falls back to the combined view when undefined. */
  parGraphGreenhouseName?: string | null;
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
  readOnly?: boolean;
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
  overviewEnabled,
  disabledSensorFields,
  bays,
  greenhouseLabel,
  parGraphTenantId,
  parGraphGreenhouseName,
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
  readOnly,
}: FarmOverviewCardProps) {
  const { t } = useI18n();

  entranceLabel = entranceLabel ?? t.pages.farmOverview.entranceLabel;

  const showEmpty = false;
  const isOverview = effectiveParameter === SENSOR_OVERVIEW_PARAMETER;
  const showGraphOption =
    effectiveParameter === 'par' || effectiveParameter === 'par_estimated';

  // Surface the all-sensors map as the first (leftmost) parameter tab, gated by
  // the "Enable Sensors" dropdown. The Overview map has no heatmap/discrete/graph
  // sub-mode.
  const parameterTabOptions = overviewEnabled
    ? [
        {
          label: t.pages.farmOverview.overview,
          value: SENSOR_OVERVIEW_PARAMETER,
        },
        ...parameterOptions,
      ]
    : parameterOptions;

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-none py-0 dark:shadow-lg">
      <div className="bg-muted/10 flex shrink-0 flex-col">
        <div className="border-border/40 bg-background flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <div className="w-full min-w-0 sm:w-auto sm:flex-1">
            <ParameterSelector
              value={effectiveParameter}
              onValueChange={onParameterChange}
              options={parameterTabOptions}
            />
          </div>
          {greenhouseDimensions && viewMode !== 'graph' && (
            <div className="text-muted-foreground hidden items-center gap-1 text-xs tabular-nums sm:flex">
              <span>{greenhouseDimensions.xDimension}m</span>
              <span className="opacity-50">×</span>
              <span>{greenhouseDimensions.yDimension}m</span>
            </div>
          )}
          {!isOverview && (
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
          )}
        </div>
        {!showEmpty && viewMode !== 'graph' && !isOverview && (
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
                disabledSensorFields={disabledSensorFields}
                greenhouseLabel={greenhouseLabel}
                parGraphTenantId={parGraphTenantId}
                parGraphGreenhouseName={parGraphGreenhouseName}
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
                readOnly={readOnly}
              />
              {viewMode !== 'graph' && (
                <EntranceLabel
                  label={entranceLabel}
                  doorPosition={greenhouseDimensions?.doorPosition}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
