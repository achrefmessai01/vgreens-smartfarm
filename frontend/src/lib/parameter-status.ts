import { getParameterUnit } from '@/lib/farm-data';
import {
  Activity,
  Battery,
  Cloud,
  Droplets,
  FlaskConical,
  Leaf,
  Sun,
  Thermometer,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const PARAMETER_ICON_MAP: Record<string, LucideIcon> = {
  temperature: Thermometer,
  soil_temp: Thermometer,
  humidity: Droplets,
  co2: FlaskConical,
  soil_ec: Waves,
  soil_moisture: Leaf,
  vpd: Cloud,
  par: Sun,
  lux: Sun,
  battery_v: Battery,
  voltage_v: Zap,
  current_ma: Zap,
  rssi: Wifi,
  snr: Wifi,
};

export type ParameterStatus = 'normal' | 'warning' | 'critical' | 'no-data';

export const PARAMETER_PRIORITY: string[] = [
  'temperature',
  'humidity',
  'co2',
  'soil_conductivity',
  'soil_ec',
  'soilEC',
  'soil_moisture',
  'soil_temp',
  'vpd',
  'par_estimated',
  'par',
  'lux',
];

export function normalizeParameterKey(parameter: string): string {
  if (['soil_conductivity', 'soil_ec', 'soilEC'].includes(parameter))
    return 'soil_ec';
  if (parameter === 'par_estimated') return 'par';
  return parameter;
}

export function getParameterAliases(parameter: string): string[] {
  const normalized = normalizeParameterKey(parameter);
  switch (normalized) {
    case 'soil_ec':
      return ['soil_conductivity', 'soil_ec', 'soilEC'];
    case 'par':
      return ['par_estimated', 'par'];
    default:
      return [parameter];
  }
}

export function getParameterIcon(parameter: string): LucideIcon {
  const n = normalizeParameterKey(parameter);
  return PARAMETER_ICON_MAP[n] ?? Activity;
}

export function getDisplayUnit(parameter: string): string {
  if (parameter === 'soil_moisture') return '% VWC';
  const normalized = normalizeParameterKey(parameter);
  const candidates =
    normalized === 'soil_ec'
      ? [parameter, 'soil_conductivity', 'soilEC']
      : [parameter, normalized];
  for (const candidate of candidates) {
    const unit = getParameterUnit(candidate).trim();
    if (unit) return unit;
  }
  return '';
}

export function getParameterStatus(
  parameter: string,
  value: number | null,
): ParameterStatus {
  if (value == null || Number.isNaN(value)) return 'no-data';
  const n = normalizeParameterKey(parameter);
  const inRange = (
    v: number,
    normal: { min: number; max: number },
    warning: { min: number; max: number },
  ): ParameterStatus => {
    if (v >= normal.min && v <= normal.max) return 'normal';
    if (v >= warning.min && v <= warning.max) return 'warning';
    return 'critical';
  };
  switch (n) {
    case 'temperature':
      return inRange(value, { min: 18, max: 25 }, { min: 15, max: 28 });
    case 'humidity':
      return inRange(value, { min: 50, max: 75 }, { min: 40, max: 85 });
    case 'co2':
      return inRange(value, { min: 350, max: 450 }, { min: 300, max: 500 });
    case 'soil_ec':
      return inRange(value, { min: 1.5, max: 2.5 }, { min: 1.0, max: 3.0 });
    case 'soil_moisture':
      return inRange(value, { min: 40, max: 70 }, { min: 30, max: 80 });
    case 'soil_temp':
      return inRange(value, { min: 18, max: 24 }, { min: 15, max: 27 });
    case 'vpd':
      return inRange(value, { min: 0.8, max: 1.2 }, { min: 0.6, max: 1.6 });
    case 'par':
      return inRange(value, { min: 200, max: 600 }, { min: 150, max: 800 });
    case 'lux':
      return inRange(
        value,
        { min: 10000, max: 50000 },
        { min: 5000, max: 65000 },
      );
    case 'battery_v':
    case 'voltage_v':
      return inRange(value, { min: 3.6, max: 5 }, { min: 3.2, max: 5 });
    case 'rssi':
      return inRange(value, { min: -90, max: -30 }, { min: -105, max: -30 });
    case 'snr':
      return inRange(value, { min: 5, max: 30 }, { min: 0, max: 30 });
    default:
      return 'normal';
  }
}

export function formatParameterValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '--';
  const abs = Math.abs(value);
  const precision = abs >= 100 ? 0 : 1;
  return value.toFixed(precision).replace(/\.0$/, '');
}
