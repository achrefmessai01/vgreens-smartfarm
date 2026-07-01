import * as React from 'react';
import { formatFieldToLabel, getParameterUnit } from '@/lib/farm-data';
import type { OverviewConfiguredSensor } from '@/lib/farm-data-live';
import { SENSOR_TYPE_TOGGLES } from '@/lib/farm-overview-constants';
import {
  getPositionFromXY,
  getSensorTypeFromDeviceId,
  getSlotPositionsFromBay,
  type GreenhouseDimensions,
} from '@/lib/sensor-map-positions';
import type { Bay, ParameterValue, PlantSlot } from '@/types/farm.types';
import type {
  AllSensorMarker,
  SensorMeasurement,
} from '@/types/view-single-bay.types';

/**
 * Builds the markers for the all-sensors map.
 *
 * The set of sensors shown is driven ENTIRELY by the farm configuration
 * (`configuredSensors`, from SensorConfig): every configured sensor for the
 * greenhouse is displayed — including ones that currently send no data — and a
 * device that is NOT configured is never shown, even if it is actively
 * reporting to InfluxDB. The live `bay` is used only to fill in each configured
 * sensor's current measurements when data happens to exist; it does not decide
 * which markers appear.
 *
 * Which measurement TYPES are included is driven by the header "Enable Sensors"
 * dropdown via `disabledSensorFields`. Sensors with no readings still render
 * (with a placeholder).
 */
export function useAllSensorsMapData(
  bay: Bay | null,
  disabledSensorFields: Set<string>,
  greenhouseDimensions?: GreenhouseDimensions | null,
  configuredSensors?: OverviewConfiguredSensor[],
): { markers: AllSensorMarker[] } {
  return React.useMemo(() => {
    if (!greenhouseDimensions || !configuredSensors) return { markers: [] };

    // Index the live bay by (whitespace-normalized) device id so a configured
    // sensor can pick up its current readings and real slot (for history
    // scoping) when it is reporting. Slot ids strip whitespace, and positions'
    // deviceIds are parsed back out of those ids, so both sides are normalized.
    const bayPositions = bay
      ? getSlotPositionsFromBay(bay, undefined, greenhouseDimensions)
      : [];
    const bayByDevice = new Map(bayPositions.map((p) => [p.deviceId, p]));

    const enabledMeasurements = (values: ParameterValue): SensorMeasurement[] => {
      const measurements: SensorMeasurement[] = [];
      for (const group of SENSOR_TYPE_TOGGLES) {
        // The dropdown toggles all fields of a group together; show the group
        // when at least one of its fields is still enabled.
        const enabled = group.fields.some((f) => !disabledSensorFields.has(f));
        if (!enabled) continue;

        // Reverse so PAR prefers `par_estimated` over `par` (single-field
        // groups are unaffected). Emit one measurement per toggle group.
        for (const field of [...group.fields].reverse()) {
          const raw = values?.[field];
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
      return measurements;
    };

    const markers: AllSensorMarker[] = [];
    const seen = new Set<string>();

    for (const cfg of configuredSensors) {
      if (cfg.hidden) continue;
      // Mirror the (0, 0) "not positioned" rule getSlotPositionsFromBay uses.
      if (cfg.xPosition === 0 && cfg.yPosition === 0) continue;

      const normalizedDevice = cfg.device.replace(/\s/g, '_');
      if (seen.has(normalizedDevice)) continue;
      seen.add(normalizedDevice);

      const live = bayByDevice.get(normalizedDevice);
      if (live) {
        // Reporting sensor: reuse its real slot so measurements and history
        // scoping (slot.meta.influxGreenhouse) work exactly as before.
        markers.push({
          slot: live.slot,
          slotId: live.slot.id,
          deviceId: live.deviceId,
          type: live.type,
          leftPercent: live.leftPercent,
          topPercent: live.topPercent,
          measurements: enabledMeasurements(live.slot.values),
        });
        continue;
      }

      // Configured but not reporting: synthesize a valueless slot. Same id shape
      // as live slots (`live_<greenhouse>|<device>|<level>`) so drag/commit and
      // slot selection resolve the device and greenhouse the same way.
      const { leftPercent, topPercent } = getPositionFromXY(
        cfg.xPosition,
        cfg.yPosition,
        greenhouseDimensions,
      );
      const slotId = `live_${cfg.greenhouse}|${cfg.device}|`.replace(/\s/g, '_');
      const slot: PlantSlot = {
        id: slotId,
        rowIndex: 0,
        columnIndex: 0,
        values: {},
        meta: {
          device: cfg.device,
          greenhouse: cfg.greenhouse,
          xPosition: cfg.xPosition,
          yPosition: cfg.yPosition,
        },
      };
      markers.push({
        slot,
        slotId,
        deviceId: normalizedDevice,
        type: getSensorTypeFromDeviceId(cfg.device),
        leftPercent,
        topPercent,
        measurements: [],
      });
    }

    return { markers };
  }, [bay, disabledSensorFields, greenhouseDimensions, configuredSensors]);
}
