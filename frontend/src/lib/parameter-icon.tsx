'use client';

import {
  Zap,
  Sun,
  Wifi,
  Leaf,
  Waves,
  Cloud,
  Battery,
  Activity,
  Droplets,
  Thermometer,
  FlaskConical,
} from 'lucide-react';
import { normalizeParameterKey } from '@/lib/parameter-status';

const DEFAULT_CLASS =
  'h-5 w-5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 shrink-0';

export interface ParameterIconProps {
  parameterKey: string;
  className?: string;
}

export function ParameterIcon({ parameterKey, className }: ParameterIconProps) {
  const n = normalizeParameterKey(parameterKey);
  const cn = className ?? DEFAULT_CLASS;
  switch (n) {
    case 'temperature':
    case 'soil_temp':
      return <Thermometer className={cn} aria-hidden />;
    case 'humidity':
      return <Droplets className={cn} aria-hidden />;
    case 'co2':
      return <FlaskConical className={cn} aria-hidden />;
    case 'soil_ec':
      return <Waves className={cn} aria-hidden />;
    case 'soil_moisture':
      return <Leaf className={cn} aria-hidden />;
    case 'vpd':
      return <Cloud className={cn} aria-hidden />;
    case 'par':
    case 'lux':
      return <Sun className={cn} aria-hidden />;
    case 'battery_v':
      return <Battery className={cn} aria-hidden />;
    case 'voltage_v':
    case 'current_ma':
      return <Zap className={cn} aria-hidden />;
    case 'rssi':
    case 'snr':
      return <Wifi className={cn} aria-hidden />;
    default:
      return <Activity className={cn} aria-hidden />;
  }
}
