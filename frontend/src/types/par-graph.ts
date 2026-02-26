import type { Bay } from '@/lib/farm-types'

export interface ParGraphSectionProps {
  bay: Bay | null
  greenhouseLabel: string
  embedded?: boolean
  className?: string
}

export interface ParCurvePoint {
  hour: number
  avg: number
  yesterday: number
  today: number | null
  lowerBand: number
  band: number
}

export interface ParGraphData {
  curveData: ParCurvePoint[]
  currentHour: number
  currentDli: number
  currentPpfd: number | null
  timeLabel: string
  yMax: number
}

