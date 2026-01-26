export type TunnelStatus = 'normal' | 'warning' | 'critical'

export interface EnvironmentData {
  temperature: number // °C
  humidity: number // %
  co2: number // ppm
  light: number // µmol/m²/s
}

export interface IrrigationData {
  soilEC: number // dS/m
  soilMoisture: number // %
  pH: number
  waterEC: number // dS/m
  lastIrrigation: string // ISO timestamp
}

export interface Tunnel {
  id: string
  name: string
  number: number
  environment: EnvironmentData
  irrigation: IrrigationData
  status: TunnelStatus
  hasWarning: boolean
  hasAlert: boolean
  warningCount: number
  alertCount: number
}
