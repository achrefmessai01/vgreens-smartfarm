import type { HeatmapPoint } from '@/lib/heatmap-utils';
import type { GreenhouseDimensions } from '@/lib/sensor-map-positions';
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
