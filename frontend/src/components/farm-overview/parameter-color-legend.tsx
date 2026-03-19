import type { ParameterType } from '@/types/farm.types';

const gradientStyle = {
  background:
    'linear-gradient(to top, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 127, 0), rgb(255, 0, 0))',
};

export const LEGEND_RANGES: Record<
  string,
  { min: number; max: number; unit: string; steps: number }
> = {
  temperature: { min: 15, max: 30, unit: '°C', steps: 5 },
  soil_temp: { min: 15, max: 30, unit: '°C', steps: 5 },
  humidity: { min: 0, max: 100, unit: '%', steps: 5 },
  soil_moisture: { min: 0, max: 100, unit: '%', steps: 5 },
  co2: { min: 400, max: 1200, unit: ' ppm', steps: 4 },
  vpd: { min: 0, max: 2, unit: ' kPa', steps: 4 },
  par: { min: 0, max: 1000, unit: ' µmol/m²/s', steps: 5 },
  par_estimated: { min: 0, max: 1000, unit: ' µmol/m²/s', steps: 5 },
  soil_conductivity: { min: 0, max: 3, unit: ' mS/cm', steps: 3 },
  soilEC: { min: 0, max: 3, unit: ' mS/cm', steps: 3 },
  battery_v: { min: 0, max: 5, unit: ' V', steps: 5 },
  voltage_v: { min: 0, max: 5, unit: ' V', steps: 5 },
  current_ma: { min: 0, max: 500, unit: ' mA', steps: 5 },
  lux: { min: 0, max: 10000, unit: ' lux', steps: 5 },
  pressure_mpa: { min: 0, max: 0.5, unit: ' MPa', steps: 5 },
  rssi: { min: -120, max: 0, unit: ' dBm', steps: 6 },
  snr: { min: -120, max: 0, unit: ' dB', steps: 6 },
};

/** Min/max scale for the top legend bar; use this to align heatmap colors with the bar. */
export function getLegendScale(parameter: ParameterType): { min: number; max: number } | null {
  const range = LEGEND_RANGES[parameter];
  return range ? { min: range.min, max: range.max } : null;
}

interface ParameterColorLegendProps {
  parameter: ParameterType;
  className?: string;
}

export function ParameterColorLegend({
  parameter,
  className,
}: ParameterColorLegendProps) {
  const range = LEGEND_RANGES[parameter];

  if (!range) {
    return null;
  }

  const labels = Array.from({ length: range.steps + 1 }, (_, i) => {
    const value = range.min + (i * (range.max - range.min)) / range.steps;
    return Math.round(value);
  }).reverse();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex h-full">
        <div className="w-4 h-full rounded-sm shrink-0" style={gradientStyle} />
        <div className="flex flex-col justify-between h-full ml-1 text-xs text-muted-foreground">
          {labels.map((label, i) => (
            <div key={i} className="relative">
              <span className="absolute -top-1.5">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horizontal color bar for the top of the map: gradient with min/max labels (same scale as sensor colors). */
export function ParameterColorLegendBar({
  parameter,
  className,
}: ParameterColorLegendProps) {
  const range = LEGEND_RANGES[parameter];

  if (!range) {
    return null;
  }

  const horizontalGradient = {
    background:
      'linear-gradient(to right, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 127, 0), rgb(255, 0, 0))',
  };

  return (
    <div
      className={`flex w-full flex-col gap-1 border-b border-border/40 bg-muted/20 px-3 py-2 sm:px-8 sm:py-1.5 ${className ?? ''}`}
    >
      <div
        className="h-3 w-full rounded-sm"
        style={horizontalGradient}
      />
      <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground tabular-nums sm:text-xs">
        <span>
          {range.min}
          {range.unit}
        </span>
        <span>
          {range.max}
          {range.unit}
        </span>
      </div>
    </div>
  );
}
