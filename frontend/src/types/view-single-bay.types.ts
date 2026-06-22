import type { HeatmapPoint } from '@/lib/heatmap-utils';
import type {
  GreenhouseDimensions,
  SensorMapType,
} from '@/lib/sensor-map-positions';
import type { Bay, ParameterType, PlantSlot } from '@/types/farm.types';

export interface ViewSingleBayProps {
  bays: Bay[];
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  bayLabel?: string;
  parameterLabel?: string;
  noSensorLabel?: string;
  className?: string;
  showOnlyFilledPositions?: boolean;
  greenhouseDimensions?: GreenhouseDimensions | null;
}

export interface SensorWithPosition {
  slot: PlantSlot | null;
  deviceId: string;
  value: number | null;
  leftPercent: number;
  topPercent: number;
  /** Unique key for this map position (same device can appear in multiple bays) */
  positionKey: string;
}

export interface FullMapDataResult {
  sensors: SensorWithPosition[];
  heatmapPoints: HeatmapPoint[];
  globalMin: number;
  globalMax: number;
  hasAnyData: boolean;
}

/** One enabled measurement shown on an all-sensors map marker. */
export interface SensorMeasurement {
  field: string;
  value: number;
  unit: string;
  label: string;
}

/**
 * A positioned sensor on the all-sensors map. Unlike `SensorWithPosition` it
 * carries every enabled measurement (not a single parameter), and is kept even
 * when it has no readings so the marker still renders with a placeholder.
 */
export interface AllSensorMarker {
  slot: PlantSlot;
  slotId: string;
  deviceId: string;
  /** Sensor family (air / soil / lux / par) — drives the marker icon & color. */
  type: SensorMapType;
  leftPercent: number;
  topPercent: number;
  measurements: SensorMeasurement[];
}
