'use client'

import * as React from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { getParameterUnit } from '@/lib/farm-data'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'

interface ParameterOption {
  label: string
  value: string
}

interface CombinedGreenhouse {
  key: string
  label: string
  meanValues: Record<string, number>
}

interface CombinedGreenhouseViewProps {
  greenhouses: CombinedGreenhouse[]
  parameters: ParameterOption[]
  noDataMessage: string
}

type ParameterStatus = 'normal' | 'warning' | 'critical' | 'no-data'

const PARAMETER_PRIORITY: string[] = [
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
]

function normalizeParameterKey(parameter: string): string {
  if (['soil_conductivity', 'soil_ec', 'soilEC'].includes(parameter)) {
    return 'soil_ec'
  }
  if (parameter === 'par_estimated') return 'par'
  return parameter
}

function getParameterAliases(parameter: string): string[] {
  const normalized = normalizeParameterKey(parameter)
  switch (normalized) {
    case 'soil_ec':
      return ['soil_conductivity', 'soil_ec', 'soilEC']
    case 'par':
      return ['par_estimated', 'par']
    default:
      return [parameter]
  }
}

function getParameterIcon(parameter: string): LucideIcon {
  const normalized = normalizeParameterKey(parameter)
  switch (normalized) {
    case 'temperature':
    case 'soil_temp':
      return Thermometer
    case 'humidity':
      return Droplets
    case 'co2':
      return FlaskConical
    case 'soil_ec':
      return Waves
    case 'soil_moisture':
      return Leaf
    case 'vpd':
      return Cloud
    case 'par':
    case 'lux':
      return Sun
    case 'battery_v':
      return Battery
    case 'voltage_v':
    case 'current_ma':
      return Zap
    case 'rssi':
    case 'snr':
      return Wifi
    default:
      return Activity
  }
}

function getDisplayUnit(parameter: string): string {
  if (parameter === 'soil_moisture') return '% VWC'
  const normalized = normalizeParameterKey(parameter)
  const candidates =
    normalized === 'soil_ec'
      ? [parameter, 'soil_conductivity', 'soilEC']
      : [parameter, normalized]

  for (const candidate of candidates) {
    const unit = getParameterUnit(candidate).trim()
    if (unit) return unit
  }

  return ''
}

function getStatus(parameter: string, value: number | null): ParameterStatus {
  if (value == null || Number.isNaN(value)) return 'no-data'

  const normalized = normalizeParameterKey(parameter)

  const inRange = (
    currentValue: number,
    normal: { min: number; max: number },
    warning: { min: number; max: number },
  ): ParameterStatus => {
    if (currentValue >= normal.min && currentValue <= normal.max) return 'normal'
    if (currentValue >= warning.min && currentValue <= warning.max)
      return 'warning'
    return 'critical'
  }

  switch (normalized) {
    case 'temperature':
      return inRange(value, { min: 18, max: 25 }, { min: 15, max: 28 })
    case 'humidity':
      return inRange(value, { min: 50, max: 75 }, { min: 40, max: 85 })
    case 'co2':
      return inRange(value, { min: 350, max: 450 }, { min: 300, max: 500 })
    case 'soil_ec':
      return inRange(value, { min: 1.5, max: 2.5 }, { min: 1.0, max: 3.0 })
    case 'soil_moisture':
      return inRange(value, { min: 40, max: 70 }, { min: 30, max: 80 })
    case 'soil_temp':
      return inRange(value, { min: 18, max: 24 }, { min: 15, max: 27 })
    case 'vpd':
      return inRange(value, { min: 0.8, max: 1.2 }, { min: 0.6, max: 1.6 })
    case 'par':
      return inRange(value, { min: 200, max: 600 }, { min: 150, max: 800 })
    case 'lux':
      return inRange(value, { min: 10000, max: 50000 }, { min: 5000, max: 65000 })
    case 'battery_v':
    case 'voltage_v':
      return inRange(value, { min: 3.6, max: 5 }, { min: 3.2, max: 5 })
    case 'rssi':
      return inRange(value, { min: -90, max: -30 }, { min: -105, max: -30 })
    case 'snr':
      return inRange(value, { min: 5, max: 30 }, { min: 0, max: 30 })
    default:
      return 'normal'
  }
}

function formatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '--'
  const abs = Math.abs(value)
  const precision = abs >= 100 ? 0 : 1
  return value.toFixed(precision).replace(/\.0$/, '')
}

function getMeanValue(
  meanValues: Record<string, number>,
  parameter: string,
): number | null {
  for (const field of getParameterAliases(parameter)) {
    const value = meanValues[field]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return null
}

export function CombinedGreenhouseView({
  greenhouses,
  parameters,
  noDataMessage,
}: CombinedGreenhouseViewProps) {
  const orderedParameters = React.useMemo(() => {
    const uniqueByValue = new Map<string, ParameterOption>()
    for (const option of parameters) {
      if (!uniqueByValue.has(option.value)) {
        uniqueByValue.set(option.value, option)
      }
    }

    const priorityByField = new Map(
      PARAMETER_PRIORITY.map((field, index) => [field, index]),
    )

    return Array.from(uniqueByValue.values()).sort((a, b) => {
      const aPriority = priorityByField.get(a.value) ?? Number.MAX_SAFE_INTEGER
      const bPriority = priorityByField.get(b.value) ?? Number.MAX_SAFE_INTEGER
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.label.localeCompare(b.label)
    })
  }, [parameters])

  if (orderedParameters.length === 0) {
    return (
      <Card className="h-full min-h-0 flex items-center justify-center p-6 rounded-sm">
        <p className="text-sm text-muted-foreground">{noDataMessage}</p>
      </Card>
    )
  }

  if (greenhouses.length === 0) {
    return (
      <Card className="h-full min-h-0 flex items-center justify-center p-6 rounded-sm">
        <p className="text-sm text-muted-foreground">{noDataMessage}</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(10.75rem,1fr))] gap-1 sm:gap-2 pb-1 items-stretch content-start">
      {greenhouses.map((greenhouse) => (
        <Card
          key={greenhouse.key}
          className="w-full gap-0 py-0 overflow-hidden rounded-sm transition-shadow duration-700 ease-out hover:shadow-md"
        >
          <div className="border-b border-border/50 bg-muted/20 px-3 py-1.5 sm:px-2 sm:py-1.5 lg:py-2">
            <CardTitle className="text-sm sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm font-semibold uppercase tracking-wider text-foreground/90">
              {greenhouse.label}
            </CardTitle>
          </div>

          <CardContent className="p-0">
            {orderedParameters.map((parameter, index) => {
              const parameterValue = getMeanValue(
                greenhouse.meanValues,
                parameter.value,
              )
              const parameterStatus = getStatus(parameter.value, parameterValue)
              const unit = getDisplayUnit(parameter.value)
              const Icon = getParameterIcon(parameter.value)

              return (
                <div
                  key={`${greenhouse.key}-${parameter.value}`}
                  className={cn(
                    'flex items-center gap-2.5 sm:gap-1.5 md:gap-2 lg:gap-2.5 px-3 sm:px-2 md:px-2.5 lg:px-3 py-1.5 sm:py-1 lg:py-1.5 transition-colors duration-700 ease-out',
                    index < orderedParameters.length - 1 &&
                      'border-b border-border/35',
                    parameterStatus === 'normal' &&
                      'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
                    parameterStatus === 'warning' &&
                      'bg-amber-500/20 text-amber-800 dark:text-amber-300',
                    parameterStatus === 'critical' &&
                      'bg-destructive/20 text-destructive',
                    parameterStatus === 'no-data' &&
                      'bg-muted/30 text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 shrink-0" aria-hidden />

                  <div className="flex flex-wrap items-baseline justify-start text-left gap-x-1 sm:gap-x-1.5 gap-y-0.5 tabular-nums min-w-0">
                    <span className="text-2xl sm:text-sm md:text-base lg:text-xl xl:text-2xl leading-none">
                      {formatValue(parameterValue)}
                    </span>
                    {unit && (
                      <span className="text-sm sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs/none opacity-85 break-all">
                        {unit}
                      </span>
                    )}
                  </div>

                  <span className="sr-only">{parameter.label}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
