import * as React from 'react';
import type {
  FullMapDataResult,
  SensorWithPosition,
} from '@/types/view-single-bay.types';
import {
  bayHasDynamicPositions,
  getSlotPositionsFromBay,
  type GreenhouseDimensions,
} from '@/lib/sensor-map-positions';
import type { HeatmapPoint } from '@/lib/heatmap-utils';
import type { Bay, ParameterType } from '@/types/farm.types';
import { isParameterSupportedByType } from '@/lib/sensor-map-parameter';

export function useFullMapData(
  bays: Bay[],
  parameter: ParameterType,
  showOnlyFilledPositions: boolean,
  greenhouseDimensions?: GreenhouseDimensions | null,
): FullMapDataResult {
  return React.useMemo(() => {
    const sensors: SensorWithPosition[] = [];
    const heatmapPoints: HeatmapPoint[] = [];
    let globalMin = Infinity;
    let globalMax = -Infinity;

    const useDynamic =
      bays.length > 0 && bays.some((b) => bayHasDynamicPositions(b));

    if (useDynamic) {
      for (const bay of bays) {
        const positions = getSlotPositionsFromBay(
          bay,
          undefined,
          greenhouseDimensions ?? undefined,
        );
        for (const p of positions) {
          if (!isParameterSupportedByType(parameter, p.type)) continue;
          const value =
            typeof p.slot.values?.[parameter] === 'number'
              ? (p.slot.values[parameter] as number)
              : null;
          const numValue = value != null && !Number.isNaN(value) ? value : null;
          if (!p.slot && showOnlyFilledPositions) continue;
          if (showOnlyFilledPositions && numValue == null) continue;

          const positionKey = `${p.slot.id}-${p.leftPercent}-${p.topPercent}`;
          sensors.push({
            slot: p.slot,
            deviceId: p.deviceId,
            value: numValue,
            leftPercent: p.leftPercent,
            topPercent: p.topPercent,
            positionKey,
          });
          if (numValue != null) {
            heatmapPoints.push({
              x: p.leftPercent,
              y: p.topPercent,
              value: numValue,
            });
            globalMin = Math.min(globalMin, numValue);
            globalMax = Math.max(globalMax, numValue);
          }
        }
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
  }, [bays, parameter, showOnlyFilledPositions, greenhouseDimensions]);
}
