import type { Bay, ParameterType, PlantSlot } from '@/types/farm.types';
import type { FarmLayoutConfig, GreenhouseDimensions } from '@/lib/sensor-map-positions';

export type SensorMapSensorType = 'air' | 'lux' | 'par' | 'soil';

export interface SensorPositionCommit {
  slotId: string;
  deviceId: string;
  greenhouse: string;
  xPosition: number;
  yPosition: number;
}

export interface ViewSensorMapProps {
  bay: Bay;
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  onSensorPositionCommit: (
    payload: SensorPositionCommit,
  ) => Promise<void> | void;
  bayLabel?: string;
  className?: string;
  showOnlyFilledPositions?: boolean;
  farmLayout?: FarmLayoutConfig;
  greenhouseDimensions?: GreenhouseDimensions | null;
  savingDeviceId?: string | null;
  positionErrorDeviceId?: string | null;
  invalidDropTitle?: string;
  invalidDropDescription?: string;
}

export interface BayRowPosition {
  bayIndex: number;
  rowIndex: number;
}

export interface SensorSlotWithPosition {
  slot: PlantSlot | null;
  deviceId: string;
  bayIndex: number;
  rowIndex: number;
  value: number | null;
}
