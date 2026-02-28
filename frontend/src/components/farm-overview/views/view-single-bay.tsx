'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  formatParameterDisplayValue,
  getParameterUnit,
  valueToHotColor,
} from '@/lib/farm-data';
import type { Bay, ParameterType, PlantSlot } from '@/lib/farm-types';
import { isParameterSupportedByType } from '@/lib/sensor-map-parameter';
import {
  SENSOR_MAP_POSITIONS,
  getBayRowFromPosition,
  getMapDeviceId,
} from '@/lib/sensor-map-positions';
import { buildDeviceToSlotMap } from '@/lib/sensor-map-utils';
import { getLegendScale } from '@/components/farm-overview/parameter-color-legend';
import { idwInterpolate, type HeatmapPoint } from '@/lib/heatmap-utils';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import * as React from 'react';

const HEATMAP_GRID_COLS = 80;
const HEATMAP_GRID_ROWS = 40;

interface SensorWithPosition {
  slot: PlantSlot | null;
  deviceId: string;
  value: number | null;
  leftPercent: number;
  topPercent: number;
  /** Unique key for this map position (same device can appear in multiple bays) */
  positionKey: string;
}

interface ViewSingleBayProps {
  bays: Bay[];
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  bayLabel?: string;
  parameterLabel?: string;
  noSensorLabel?: string;
  className?: string;
  showOnlyFilledPositions?: boolean;
}

function useFullMapData(
  bays: Bay[],
  parameter: ParameterType,
  showOnlyFilledPositions: boolean,
): {
  sensors: SensorWithPosition[];
  heatmapPoints: HeatmapPoint[];
  globalMin: number;
  globalMax: number;
  hasAnyData: boolean;
} {
  return React.useMemo(() => {
    const sensors: SensorWithPosition[] = [];
    const heatmapPoints: HeatmapPoint[] = [];
    let globalMin = Infinity;
    let globalMax = -Infinity;

    const singleBay = bays.length === 1 ? bays[0] ?? null : null;
    const singleBayDeviceToSlot =
      singleBay !== null ? buildDeviceToSlotMap(singleBay) : null;
    const deviceToSlotByBay = new Map<number, Map<string, PlantSlot>>();
    const getDeviceToSlot = (bayIndex: number) => {
      let map = deviceToSlotByBay.get(bayIndex);
      if (!map) {
        const bay = bays[bayIndex] ?? null;
        map = bay ? buildDeviceToSlotMap(bay) : new Map();
        deviceToSlotByBay.set(bayIndex, map);
      }
      return map;
    };

    for (const pos of SENSOR_MAP_POSITIONS) {
      if (!isParameterSupportedByType(parameter, pos.type)) continue;
      const { bayIndex } = getBayRowFromPosition(pos);
      const deviceToSlot =
        singleBayDeviceToSlot !== null
          ? singleBayDeviceToSlot
          : getDeviceToSlot(bayIndex);
      const slot = deviceToSlot.get(getMapDeviceId(pos.deviceId)) ?? null;
      if (!slot && showOnlyFilledPositions) continue;
      const value =
        slot && typeof slot.values?.[parameter] === 'number'
          ? (slot.values[parameter] as number)
          : null;
      const numValue = value != null && !Number.isNaN(value) ? value : null;

      sensors.push({
        slot,
        deviceId: pos.deviceId,
        value: numValue,
        leftPercent: pos.leftPercent,
        topPercent: pos.topPercent,
        positionKey: `${bayIndex}-${pos.leftPercent}-${pos.topPercent}-${pos.deviceId}`,
      });
      if (numValue != null) {
        heatmapPoints.push({
          x: pos.leftPercent,
          y: pos.topPercent,
          value: numValue,
        });
        globalMin = Math.min(globalMin, numValue);
        globalMax = Math.max(globalMax, numValue);
      }
    }

    if (globalMin === Infinity) globalMin = 0;
    if (globalMax === -Infinity) globalMax = 1;
    if (globalMin === globalMax) {
      globalMin = globalMin - 1;
      globalMax = globalMax + 1;
    }
    const hasAnyData = heatmapPoints.length > 0;

    return {
      sensors,
      heatmapPoints,
      globalMin,
      globalMax,
      hasAnyData,
    };
  }, [bays, parameter, showOnlyFilledPositions]);
}

export function ViewSingleBay({
  bays,
  parameter,
  selectedSlotId,
  onSelectSlot,
  className,
  showOnlyFilledPositions = false,
}: ViewSingleBayProps) {
  const { t } = useI18n();
  const unit = getParameterUnit(parameter);
  const {
    sensors,
    heatmapPoints,
    globalMin,
    globalMax,
    hasAnyData,
  } = useFullMapData(bays, parameter, showOnlyFilledPositions);

  const heatmapGrid = React.useMemo(
    () => idwInterpolate(HEATMAP_GRID_COLS, HEATMAP_GRID_ROWS, heatmapPoints, 2),
    [heatmapPoints],
  );

  const scale = getLegendScale(parameter);
  const scaleMin = scale?.min ?? globalMin;
  const scaleMax = scale?.max ?? globalMax;

  return (
    <Card
      className={cn(
        'h-full w-full border border-border/40',
        'bg-white dark:bg-background',
        className,
      )}
    >
      <CardContent className="p-3 h-full flex flex-col min-h-0">
        <div className="flex-1 min-h-0 rounded-lg flex overflow-hidden">
          {!hasAnyData ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground w-full">
              {t.pages.farmOverview.noData}
            </div>
          ) : (
            <div className="flex-1 min-w-0 min-h-0 relative rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden h-full">
              <div
                className="absolute inset-0 grid w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${HEATMAP_GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${HEATMAP_GRID_ROWS}, 1fr)`,
                }}
              >
                {heatmapGrid.map((row, i) =>
                  row.map((val, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="min-w-0 min-h-0"
                      style={{
                        backgroundColor: Number.isNaN(val)
                          ? 'rgb(240,240,240)'
                          : valueToHotColor(val, scaleMin, scaleMax),
                      }}
                    />
                  )),
                )}
              </div>
              {sensors.map(({ slot, deviceId, value, leftPercent, topPercent, positionKey }) => {
                const isSelected = slot && selectedSlotId === slot.id;
                const displayValue =
                  value != null ? formatParameterDisplayValue(value) : '--';
                return (
                  <button
                    key={positionKey}
                    type="button"
                    onClick={() =>
                      onSelectSlot(
                        slot ? (isSelected ? null : slot.id) : null,
                      )
                    }
                    disabled={!slot}
                    title={
                      slot && value != null
                        ? `${deviceId}: ${displayValue}${unit ? ` ${unit}` : ''}`
                        : deviceId
                    }
                    className={cn(
                      'absolute text-xs font-medium tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                      slot && 'cursor-pointer',
                      isSelected && 'ring-2 ring-primary ring-offset-1 rounded',
                    )}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label={
                      slot && value != null
                        ? `${displayValue} ${unit}`
                        : t.pages.farmOverview.noSensor
                    }
                  >
                    {value != null
                      ? `${displayValue}${unit ? ` ${unit}` : ''}`
                      : '--'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
