'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SensorTile } from './sensor-tile'
import type { TunnelStatus } from '@/lib/tunnel-types'
import { cn } from '@/lib/utils'

export interface SensorBlock {
  id: string
  label: string
  value: string | number
  unit?: string
  status: TunnelStatus
}

interface GreenhouseSensorViewProps {
  sensorBlocks: SensorBlock[]
  onBlockClick?: (blockId: string) => void
  selectedBlockId?: string | null
  className?: string
}

/** One big greenhouse area with a grid of sensor value blocks */
export function GreenhouseSensorView({
  sensorBlocks,
  onBlockClick,
  selectedBlockId,
  className,
}: GreenhouseSensorViewProps) {
  return (
    <Card
      className={cn(
        'h-full w-full border-2 border-border/60 bg-card/80 rounded-xl overflow-hidden',
        className
      )}
    >
      <CardContent className="p-4 h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full auto-rows-fr">
          {sensorBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => onBlockClick?.(block.id)}
              className={cn(
                'text-left rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[100px]',
                selectedBlockId === block.id &&
                  'ring-2 ring-primary ring-offset-2'
              )}
            >
              <SensorTile
                label={block.label}
                value={block.value}
                unit={block.unit}
                status={block.status}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** Mock sensor data per greenhouse (replace with API later) */
export function useMockGreenhouseSensors(
  greenhouseId: string
): SensorBlock[] {
  return React.useMemo(() => {
    const base = greenhouseId === 'greenhouse1' ? 0 : 2
    return [
      {
        id: `${greenhouseId}-temp`,
        label: 'Temperature',
        value: (21.2 + base * 0.5).toFixed(1),
        unit: '°C',
        status: 'normal',
      },
      {
        id: `${greenhouseId}-humidity`,
        label: 'Humidity',
        value: 68 + base,
        unit: '%',
        status: 'normal',
      },
      {
        id: `${greenhouseId}-light`,
        label: 'Light',
        value: 420 + base * 20,
        unit: 'µmol/m²/s',
        status: 'normal',
      },
      {
        id: `${greenhouseId}-co2`,
        label: 'CO₂',
        value: 820 + base * 30,
        unit: 'ppm',
        status: base ? 'warning' : 'normal',
      },
      {
        id: `${greenhouseId}-soil-moisture`,
        label: 'Soil Moisture',
        value: 45 + base * 5,
        unit: '%',
        status: 'normal',
      },
      {
        id: `${greenhouseId}-ph`,
        label: 'pH',
        value: (6.2 + base * 0.1).toFixed(1),
        status: 'normal',
      },
    ]
  }, [greenhouseId])
}
