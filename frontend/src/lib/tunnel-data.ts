import type {
  Tunnel,
  EnvironmentData,
  IrrigationData,
  TunnelStatus,
} from './tunnel-types'

// Thresholds for status determination
const TEMP_NORMAL = { min: 18, max: 25 }
const TEMP_WARNING = { min: 15, max: 28 }
const HUMIDITY_NORMAL = { min: 50, max: 75 }
const HUMIDITY_WARNING = { min: 40, max: 85 }
const CO2_NORMAL = { min: 350, max: 450 }
const CO2_WARNING = { min: 300, max: 500 }
const LIGHT_NORMAL = { min: 200, max: 600 }
const LIGHT_WARNING = { min: 150, max: 700 }
const SOIL_MOISTURE_NORMAL = { min: 40, max: 70 }
const SOIL_MOISTURE_WARNING = { min: 30, max: 80 }
const PH_NORMAL = { min: 5.5, max: 6.5 }
const PH_WARNING = { min: 5.0, max: 7.0 }

function getStatusFromValue(
  value: number,
  normal: { min: number; max: number },
  warning: { min: number; max: number }
): 'normal' | 'warning' | 'critical' {
  if (value >= normal.min && value <= normal.max) {
    return 'normal'
  }
  if (value >= warning.min && value <= warning.max) {
    return 'warning'
  }
  return 'critical'
}

function generateEnvironmentData(): EnvironmentData {
  return {
    temperature: 19 + Math.random() * 6, // 19-25°C
    humidity: 55 + Math.random() * 20, // 55-75%
    co2: 380 + Math.random() * 60, // 380-440 ppm
    light: 300 + Math.random() * 400, // 300-700 µmol/m²/s
  }
}

function generateIrrigationData(): IrrigationData {
  const hoursAgo = Math.floor(Math.random() * 48) // 0-48 hours ago
  const lastIrrigation = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

  return {
    soilEC: 1.5 + Math.random() * 1.0, // 1.5-2.5 dS/m
    soilMoisture: 45 + Math.random() * 25, // 45-70%
    pH: 5.8 + Math.random() * 0.8, // 5.8-6.6
    waterEC: 1.2 + Math.random() * 0.8, // 1.2-2.0 dS/m
    lastIrrigation: lastIrrigation.toISOString(),
  }
}

function calculateTunnelStatus(
  environment: EnvironmentData,
  irrigation: IrrigationData
): {
  status: TunnelStatus
  hasWarning: boolean
  hasAlert: boolean
  warningCount: number
  alertCount: number
} {
  const statuses: TunnelStatus[] = []
  let warningCount = 0
  let alertCount = 0

  // Check environment parameters
  const tempStatus = getStatusFromValue(
    environment.temperature,
    TEMP_NORMAL,
    TEMP_WARNING
  )
  statuses.push(tempStatus)
  if (tempStatus === 'warning') warningCount++
  if (tempStatus === 'critical') alertCount++

  const humidityStatus = getStatusFromValue(
    environment.humidity,
    HUMIDITY_NORMAL,
    HUMIDITY_WARNING
  )
  statuses.push(humidityStatus)
  if (humidityStatus === 'warning') warningCount++
  if (humidityStatus === 'critical') alertCount++

  const co2Status = getStatusFromValue(environment.co2, CO2_NORMAL, CO2_WARNING)
  statuses.push(co2Status)
  if (co2Status === 'warning') warningCount++
  if (co2Status === 'critical') alertCount++

  const lightStatus = getStatusFromValue(
    environment.light,
    LIGHT_NORMAL,
    LIGHT_WARNING
  )
  statuses.push(lightStatus)
  if (lightStatus === 'warning') warningCount++
  if (lightStatus === 'critical') alertCount++

  // Check irrigation parameters
  const moistureStatus = getStatusFromValue(
    irrigation.soilMoisture,
    SOIL_MOISTURE_NORMAL,
    SOIL_MOISTURE_WARNING
  )
  statuses.push(moistureStatus)
  if (moistureStatus === 'warning') warningCount++
  if (moistureStatus === 'critical') alertCount++

  // Note: pH and waterEC are system-wide, not per tunnel, so they're not included in tunnel status

  // Determine overall status
  let overallStatus: TunnelStatus = 'normal'
  if (statuses.includes('critical')) {
    overallStatus = 'critical'
  } else if (statuses.includes('warning')) {
    overallStatus = 'warning'
  }

  return {
    status: overallStatus,
    hasWarning: warningCount > 0,
    hasAlert: alertCount > 0,
    warningCount,
    alertCount,
  }
}

export function generateTunnels(): Tunnel[] {
  const tunnels: Tunnel[] = []

  for (let i = 1; i <= 13; i++) {
    const environment = generateEnvironmentData()
    const irrigation = generateIrrigationData()
    const statusInfo = calculateTunnelStatus(environment, irrigation)

    tunnels.push({
      id: `tunnel-${i}`,
      name: `Tunnel ${i}`,
      number: i,
      environment,
      irrigation,
      ...statusInfo,
    })
  }

  return tunnels
}

export function getAllTunnels(): Tunnel[] {
  return generateTunnels()
}

// System-wide irrigation parameters (not per tunnel)
export interface SystemIrrigationData {
  pH: number
  waterEC: number
}

export function getSystemIrrigationData(): SystemIrrigationData {
  return {
    pH: 5.8 + Math.random() * 0.8, // 5.8-6.6
    waterEC: 1.2 + Math.random() * 0.8, // 1.2-2.0 dS/m
  }
}
