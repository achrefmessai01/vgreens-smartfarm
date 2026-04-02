'use client';

import * as React from 'react';
import GaugeComponent from 'react-gauge-component';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import type { TunnelStatus } from '@/types/tunnel.types';

interface SensorGaugeProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  warningMin: number;
  warningMax: number;
  status: TunnelStatus;
  className?: string;
}

export function SensorGauge({
  label,
  value,
  unit,
  min,
  max,
  normalMin,
  normalMax,
  warningMin,
  warningMax,
  status,
  className,
}: SensorGaugeProps) {
  const statusConfig = {
    normal: {
      bg: 'bg-white dark:bg-card',
      border: 'border-border/50 dark:border-border/30',
      dot: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
      pointerColor: '#22c55e',
    },
    warning: {
      bg: 'bg-white dark:bg-card',
      border: 'border-yellow-500/30 dark:border-yellow-500/20',
      dot: 'bg-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400',
      pointerColor: '#eab308',
    },
    critical: {
      bg: 'bg-white dark:bg-card',
      border: 'border-red-500/30 dark:border-red-500/20',
      dot: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      pointerColor: '#ef4444',
    },
  };

  const config = statusConfig[status];
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate percentage for the gauge (0-100)
  const range = max - min;
  const valuePercent = Math.min(
    100,
    Math.max(0, ((value - min) / range) * 100),
  );

  // Create color zones for the gauge
  // Red at edges, orange in warning zones, green in normal zone
  const subArcs = [];

  // Critical zone (below warning) - Red
  if (warningMin > min) {
    const criticalPercent = ((warningMin - min) / range) * 100;
    subArcs.push({
      limit: criticalPercent,
      color: '#ef4444',
      showTick: false,
    });
  }

  // Warning zone (below normal) - Orange
  if (normalMin > warningMin) {
    const warningBelowPercent = ((normalMin - min) / range) * 100;
    subArcs.push({
      limit: warningBelowPercent,
      color: '#f97316',
      showTick: false,
    });
  }

  // Normal zone - Green
  const normalPercent = ((normalMax - min) / range) * 100;
  subArcs.push({
    limit: normalPercent,
    color: '#22c55e',
    showTick: false,
  });

  // Warning zone (above normal) - Orange
  if (warningMax > normalMax) {
    const warningAbovePercent = ((warningMax - min) / range) * 100;
    subArcs.push({
      limit: warningAbovePercent,
      color: '#f97316',
      showTick: false,
    });
  }

  // Critical zone (above warning) - Red
  if (max > warningMax) {
    subArcs.push({
      limit: 100,
      color: '#ef4444',
      showTick: false,
    });
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-3 transition-all duration-300',
        'shadow-md hover:scale-105 hover:shadow-xl',
        'backdrop-blur-lg',
        !isDark &&
          'bg-white/80 [background:linear-gradient(to_bottom_right,#3bc0d026,#3a7c988c))]',
        isDark && 'from-card to-card/100 bg-gradient-to-br',
        config.border,
        className,
      )}
    >
      {/* Header with label and status dot */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-foreground/80 text-xs font-bold tracking-wide uppercase dark:text-white">
          {label}
        </p>
        <div
          className={cn(
            'dark:ring-card h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ring-2 ring-white',
            config.dot,
          )}
        />
      </div>

      {/* Gauge Component */}
      <div
        className="mb-3 w-full [&_svg_text]:fill-gray-900 dark:[&_svg_text]:fill-white"
        style={{ height: '90px' }}
      >
        <GaugeComponent
          value={valuePercent}
          type="semicircle"
          arc={{
            subArcs,
            padding: 0.02,
            cornerRadius: 1,
          }}
          pointer={{
            color: config.pointerColor,
            length: 0.7,
            width: 10,
            elastic: false,
          }}
          labels={{
            valueLabel: {
              style: { fontSize: '0px', display: 'none' }, // Hide default value label
            },
            tickLabels: {
              type: 'outer',
              defaultTickValueConfig: {
                style: {
                  fontSize: '10px',
                  fontWeight: '600',
                },
              },
              ticks: [
                {
                  value: 0,
                  valueConfig: {
                    formatTextValue: () => {
                      if (unit === 'ppm' || unit === 'µmol/m²/s') {
                        return Math.round(min).toString();
                      }
                      if (unit === 'pH' || unit === 'dS/m') {
                        return min.toFixed(1);
                      }
                      return min.toFixed(0);
                    },
                    style: {
                      fontSize: '10px',
                      fontWeight: '600',
                    },
                  },
                },
                {
                  value: 100,
                  valueConfig: {
                    formatTextValue: () => {
                      if (unit === 'ppm' || unit === 'µmol/m²/s') {
                        return Math.round(max).toString();
                      }
                      if (unit === 'pH' || unit === 'dS/m') {
                        return max.toFixed(1);
                      }
                      return max.toFixed(0);
                    },
                    style: {
                      fontSize: '10px',
                      fontWeight: '600',
                    },
                  },
                },
              ],
            },
          }}
          minValue={0}
          maxValue={100}
        />
      </div>

      {/* Value Display - Large and prominent */}
      <div className="text-center">
        <p
          className={cn(
            'text-xl leading-tight font-extrabold tracking-tight',
            config.text,
          )}
        >
          {value.toFixed(
            unit === 'ppm' || unit === 'µmol/m²/s'
              ? 0
              : unit === 'pH' || unit === 'dS/m'
                ? 2
                : 1,
          )}
          {unit && (
            <span className="ml-1.5 text-sm font-bold opacity-80">{unit}</span>
          )}
        </p>
      </div>
    </div>
  );
}
