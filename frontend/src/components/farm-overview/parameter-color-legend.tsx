'use client'

import * as React from 'react'
import type { ParameterType } from '@/lib/farm-types'

interface ParameterColorLegendProps {
  parameter: ParameterType
}

export function ParameterColorLegend({ parameter }: ParameterColorLegendProps) {
  const renderLegend = () => {
    switch (parameter) {
      case 'temperature':
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">19°C</span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                title="19°C = Blue"
              />
              <div
                className="w-20 h-3 rounded-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgb(0, 0, 255), rgb(0, 255, 255), rgb(0, 255, 0), rgb(255, 255, 0), rgb(255, 127, 0), rgb(255, 0, 0))',
                }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(255, 0, 0)' }}
                title="22°C = Red"
              />
            </div>
            <span className="text-muted-foreground">22°C</span>
          </div>
        )

      case 'energyBalance':
        return (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 0, 200)' }}
                title="Source limited (high) = Blue"
              />
              <span className="text-muted-foreground whitespace-nowrap">
                Source limited
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 200, 0)' }}
                title="Balanced = Green"
              />
              <span className="text-muted-foreground whitespace-nowrap">
                Balanced
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(200, 0, 0)' }}
                title="Sink-limited (low) = Red"
              />
              <span className="text-muted-foreground whitespace-nowrap">
                Sink-limited
              </span>
            </div>
          </div>
        )

      case 'canopyCover':
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">
              0 sq cm
            </span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 0, 100)' }}
                title="0 sq cm = Light Blue"
              />
              <div
                className="w-12 h-2 rounded-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgb(0, 0, 100), rgb(0, 0, 255))',
                }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                title="1000 sq cm = Dark Blue"
              />
            </div>
            <span className="text-muted-foreground whitespace-nowrap">
              1000 sq cm
            </span>
          </div>
        )

      case 'fruitLoad':
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">0</span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 100, 0)' }}
                title="0 = Light Green"
              />
              <div
                className="w-12 h-2 rounded-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgb(0, 100, 0), rgb(0, 255, 0))',
                }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 255, 0)' }}
                title="13 = Dark Green"
              />
            </div>
            <span className="text-muted-foreground">13</span>
          </div>
        )

      case 'humidity':
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">0%</span>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 100, 100)' }}
                title="0% = Light Cyan"
              />
              <div
                className="w-12 h-2 rounded-sm"
                style={{
                  background:
                    'linear-gradient(to right, rgb(0, 100, 100), rgb(0, 255, 255))',
                }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: 'rgb(0, 255, 255)' }}
                title="100% = Dark Cyan"
              />
            </div>
            <span className="text-muted-foreground">100%</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex items-center flex-wrap gap-2">{renderLegend()}</div>
  )
}
