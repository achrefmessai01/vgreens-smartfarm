'use client'

import * as React from 'react'
import type { ParameterType } from '@/lib/farm-types'

const gradientStyle = {
  background:
    'linear-gradient(to right, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 127, 0), rgb(255, 0, 0))',
}

interface ParameterColorLegendProps {
  parameter: ParameterType
}

function GradientLegend({
  lowLabel,
  highLabel,
}: {
  lowLabel: string
  highLabel: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground whitespace-nowrap">{lowLabel}</span>
      <div className="flex items-center gap-1">
        <div
          className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
          style={{ backgroundColor: 'rgb(0, 0, 255)' }}
        />
        <div className="w-20 h-3 rounded-sm shrink-0" style={gradientStyle} />
        <div
          className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
          style={{ backgroundColor: 'rgb(255, 0, 0)' }}
        />
      </div>
      <span className="text-muted-foreground whitespace-nowrap">{highLabel}</span>
    </div>
  )
}

const LEGEND_RANGES: Record<string, { low: string; high: string }> = {
  temperature: { low: '15°C', high: '30°C' },
  soil_temp: { low: '15°C', high: '30°C' },
  humidity: { low: '0%', high: '100%' },
  soil_moisture: { low: '0%', high: '100%' },
  co2: { low: '400 ppm', high: '1200 ppm' },
  vpd: { low: '0 kPa', high: '2 kPa' },
  par: { low: '0', high: '1000 µmol/m²/s' },
  par_estimated: { low: '0', high: '1000 µmol/m²/s' },
  soil_conductivity: { low: '0 mS/cm', high: '3 mS/cm' },
  soilEC: { low: '0 mS/cm', high: '3 mS/cm' },
  battery_v: { low: '0 V', high: '5 V' },
  voltage_v: { low: '0 V', high: '5 V' },
  current_ma: { low: '0 mA', high: '500 mA' },
  lux: { low: '0', high: '10000 lux' },
  pressure_mpa: { low: '0 MPa', high: '0.5 MPa' },
  rssi: { low: '-120 dBm', high: '0 dBm' },
  snr: { low: '-120 dB', high: '0 dB' },
}

export function ParameterColorLegend({ parameter }: ParameterColorLegendProps) {
  const range = LEGEND_RANGES[parameter]
  const legend = range ? (
    <GradientLegend lowLabel={range.low} highLabel={range.high} />
  ) : parameter ? (
    <GradientLegend lowLabel="Low" highLabel="High" />
  ) : null

  return (
    <div className="flex items-center flex-wrap gap-2">{legend}</div>
  )
}
