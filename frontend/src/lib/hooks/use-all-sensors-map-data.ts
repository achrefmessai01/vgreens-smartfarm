import * as React from 'react';
import { formatFieldToLabel, getParameterUnit } from '@/lib/farm-data';
import { SENSOR_TYPE_TOGGLES } from '@/lib/farm-overview-constants';
import {
  getSlotPositionsFromBay,
  type GreenhouseDimensions,
} from '@/lib/sensor-map-positions';
import type { Bay } from '@/types/farm.types';
import type {
  AllSensorMarker,
  SensorMeasurement,
} from '@/types/view-single-bay.types';

/**
 * Builds the markers for the all-sensors map: every positioned, non-hidden
 * sensor in the bay, each carrying ALL of its currently-enabled measurements.
 *
 * Unlike `useFullMapData` it does not filter to a single parameter and it keeps
 * sensors that have no readings (so the marker still renders with a
 * placeholder). Which measurement TYPES are included is driven by the header
 * "Enable Sensors" dropdown via `disabledSensorFields`.
 */
export function useAllSensorsMapData(
  bay: Bay | null,
  disabledSensorFields: Set<string>,
  greenhouseDimensions?: GreenhouseDimensions | null,
): { markers: AllSensorMarker[] } {
  return React.useMemo(() => {
    if (!bay || !greenhouseDimensions) return { markers: [] };

    const positions = getSlotPositionsFromBay(
      bay,
      undefined,
      greenhouseDimensions,
    );

    const markers: AllSensorMarker[] = [];
    for (const p of positions) {
      if (p.slot.meta?.hiddenInFarmOverview === true) continue;

      const measurements: SensorMeasurement[] = [];
      for (const group of SENSOR_TYPE_TOGGLES) {
        // The dropdown toggles all fields of a group together; show the group
        // when at least one of its fields is still enabled.
        const enabled = group.fields.some((f) => !disabledSensorFields.has(f));
        if (!enabled) continue;

        // Reverse so PAR prefers `par_estimated` over `par` (single-field
        // groups are unaffected). Emit one measurement per toggle group.
        for (const field of [...group.fields].reverse()) {
          const raw = p.slot.values?.[field];
          if (typeof raw === 'number' && Number.isFinite(raw)) {
            measurements.push({
              field,
              value: raw,
              unit: getParameterUnit(field),
              label: formatFieldToLabel(field),
            });
            break;
          }
        }
      }

      markers.push({
        slot: p.slot,
        slotId: p.slot.id,
        deviceId: p.deviceId,
        type: p.type,
        leftPercent: p.leftPercent,
        topPercent: p.topPercent,
        measurements,
      });
    }

    return { markers };
  }, [bay, disabledSensorFields, greenhouseDimensions]);
}
