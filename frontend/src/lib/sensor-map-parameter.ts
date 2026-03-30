import type { ParameterType } from '@/types/farm.types';
import type { SensorMapType } from '@/lib/sensor-map-positions';

export function isParameterSupportedByType(
  parameter: ParameterType,
  type: SensorMapType,
): boolean {
  switch (parameter) {
    case 'temperature':
    case 'humidity':
    case 'co2':
    case 'vpd':
    case 'battery_v':
    case 'voltage_v':
    case 'current_ma':
    case 'rssi':
    case 'snr':
      return type === 'air';
    case 'par':
    case 'par_estimated':
    case 'lux':
      return type === 'lux';
    case 'soil_moisture':
    case 'soil_temp':
    case 'soil_conductivity':
    case 'soilEC':
      return type === 'soil';
    default:
      return true;
  }
}
