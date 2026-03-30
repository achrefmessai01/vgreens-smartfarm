import type { Bay, ParameterType, PlantSlot } from '@/types/farm.types';

export type SensorMapSensorType = 'air' | 'lux' | 'par' | 'soil';

export interface ViewSensorMapProps {
  bay: Bay;
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  bayLabel?: string;
  className?: string;
  showOnlyFilledPositions?: boolean;
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
