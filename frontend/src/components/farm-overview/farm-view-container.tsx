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
import { ParGraphSection } from './par-graph-section';
import { ViewAllSensorsMap } from './views/view-all-sensors-map';
import { ViewSensorMap } from './views/view-sensor-map';
import { ViewSingleBay } from './views/view-single-bay';

interface FarmDataDisplayProps {
  bays: Bay[];
  viewMode: ViewMode;
  parameter: ParameterType;
  /** Disabled sensor `_field` set ("Enable Sensors" dropdown) — all-sensors map. */
  disabledSensorFields: Set<string>;
  greenhouseLabel: string;
  /** Optional tenant override forwarded to the embedded PAR graph in
   *  `graph` view. Required for vGreens admins viewing another tenant. */
  parGraphTenantId?: string | null;
  /** Greenhouse name passed through to the PAR graph for tenant-aware
   *  slicing. Falls back to the combined view when undefined. */
  parGraphGreenhouseName?: string | null;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  parameterLabel: string;
  noSensorLabel: string;
  noDataMessage: string;
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

export function FarmDataDisplay({
  bays,
  viewMode,
  parameter,
  disabledSensorFields,
  greenhouseLabel,
  parGraphTenantId,
  parGraphGreenhouseName,
  selectedSlotId,
  onSelectSlot,
  parameterLabel,
  noSensorLabel,
  noDataMessage,
  farmLayout,
  greenhouseDimensions,
  onSensorPositionCommit,
  savingDeviceId,
  positionErrorDeviceId,
  invalidDropTitle,
  invalidDropDescription,
  readOnly,
}: FarmDataDisplayProps) {
  const showEmpty = bays.length === 0 && viewMode !== 'graph';
  if (showEmpty) {
    return <EmptyState message={noDataMessage} />;
  }

  const dims = viewMode !== 'graph' ? greenhouseDimensions : null;
  // Horizontal layout renders the greenhouse rotated 90°, so the on-screen
  // axes swap: the length (y) runs left→right and the width (x) runs top→bottom.
  const horizontalAxisDim = dims
    ? dims.isHorizontal
      ? dims.yDimension
      : dims.xDimension
    : null;
  const verticalAxisDim = dims
    ? dims.isHorizontal
      ? dims.xDimension
      : dims.yDimension
    : null;

  return (
    <div
      className={
        viewMode === 'graph'
          ? 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-clip'
          : 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-clip p-0.5 sm:p-2'
      }
    >
      {parameter === SENSOR_OVERVIEW_PARAMETER ? (
        <div className="relative min-h-0 flex-1">
          <ViewAllSensorsMap
            key={bays[0].id}
            bay={bays[0]}
            tenantId={parGraphTenantId}
            disabledSensorFields={disabledSensorFields}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            className="h-full w-full"
            onSensorPositionCommit={onSensorPositionCommit}
            savingDeviceId={savingDeviceId}
            positionErrorDeviceId={positionErrorDeviceId}
            invalidDropTitle={invalidDropTitle}
            invalidDropDescription={invalidDropDescription}
            readOnly={readOnly}
            greenhouseDimensions={dims}
          />
          {dims && (
            <div className="pointer-events-none absolute right-8 bottom-6 left-5 flex items-center justify-between text-[10px] text-white/50 tabular-nums sm:right-12 sm:bottom-12 sm:left-10 sm:text-xs">
              <span>← {horizontalAxisDim} m →</span>
              <span>↕ {verticalAxisDim} m</span>
            </div>
          )}
        </div>
      ) : viewMode === 'graph' ? (
        <ParGraphSection
          bay={bays[0] ?? null}
          greenhouseLabel={greenhouseLabel}
          tenantId={parGraphTenantId}
          greenhouseName={parGraphGreenhouseName}
          embedded
          className="h-full w-full"
        />
      ) : viewMode === 'discrete' ? (
        <div className="relative min-h-0 flex-1">
          <ViewSensorMap
            key={bays[0].id}
            bay={bays[0]}
            parameter={parameter}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            className="h-full w-full"
            onSensorPositionCommit={onSensorPositionCommit}
            savingDeviceId={savingDeviceId}
            positionErrorDeviceId={positionErrorDeviceId}
            invalidDropTitle={invalidDropTitle}
            invalidDropDescription={invalidDropDescription}
            readOnly={readOnly}
            showOnlyFilledPositions={false}
            farmLayout={farmLayout}
            greenhouseDimensions={dims}
          />
          {dims && (
            <div className="pointer-events-none absolute right-8 bottom-6 left-5 flex items-center justify-between text-[10px] text-white/50 tabular-nums sm:right-12 sm:bottom-12 sm:left-10 sm:text-xs">
              <span>← {horizontalAxisDim} m →</span>
              <span>↕ {verticalAxisDim} m</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-full min-h-0">
          <ViewSingleBay
            key={bays.map((b) => b.id).join('-')}
            bays={bays}
            parameter={parameter}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            parameterLabel={parameterLabel}
            noSensorLabel={noSensorLabel}
            className="h-full"
            greenhouseDimensions={dims}
          />
          {dims && (
            <div className="pointer-events-none absolute right-8 bottom-6 left-5 flex items-center justify-between text-[10px] text-white/50 tabular-nums sm:right-12 sm:bottom-12 sm:left-10 sm:text-xs">
              <span>← {horizontalAxisDim} m →</span>
              <span>↕ {verticalAxisDim} m</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
