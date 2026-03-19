import type { ParameterType, HistoryDataPoint } from '@/types/farm.types'

export function generateHistoryDataForParameter(
  parameter: ParameterType,
  timeRange: '1day' | '1week' | '1month'
): HistoryDataPoint[] {
  const now = new Date()
  const data: HistoryDataPoint[] = []
  let pointCount = 0
  let intervalMs = 0

  switch (timeRange) {
    case '1day':
      pointCount = 24 // Hourly data
      intervalMs = 60 * 60 * 1000 // 1 hour
      break
    case '1week':
      pointCount = 7 * 4 // 4 times per day
      intervalMs = 6 * 60 * 60 * 1000 // 6 hours
      break
    case '1month':
      pointCount = 30 // Daily data
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      break
  }

  // Generate base value based on parameter (supports dynamic _field names from bucket)
  const getBaseValue = (index: number, total: number): number => {
    const progress = index / total
    switch (parameter) {
      case 'temperature':
      case 'soil_temp':
        return 20 + Math.sin(progress * Math.PI * 2) * 3 + Math.random() * 1
      case 'co2':
        return 600 + Math.sin(progress * Math.PI * 2) * 200 + Math.random() * 50
      case 'humidity':
      case 'soil_moisture':
        return 65 + Math.sin(progress * Math.PI * 2) * 15 + Math.random() * 10
      case 'vpd':
        return 0.8 + Math.sin(progress * Math.PI * 2) * 0.4 + Math.random() * 0.2
      case 'par':
      case 'par_estimated':
        return 400 + Math.sin(progress * Math.PI * 2) * 300 + Math.random() * 100
      case 'soil_conductivity':
      case 'soilEC':
        return 1.2 + Math.sin(progress * Math.PI * 2) * 0.5 + Math.random() * 0.2
      case 'battery_v':
      case 'voltage_v':
        return 3.5 + Math.sin(progress * Math.PI * 2) * 0.5 + Math.random() * 0.2
      case 'lux':
        return 500 + Math.sin(progress * Math.PI * 2) * 500 + Math.random() * 100
      case 'rssi':
      case 'snr':
        return -70 + Math.sin(progress * Math.PI * 2) * 20 + Math.random() * 5
      default:
        return 50 + Math.random() * 50
    }
  }

  for (let i = 0; i < pointCount; i++) {
    const timestamp = new Date(now.getTime() - (pointCount - i) * intervalMs)
    const value = getBaseValue(i, pointCount)

    // Clamp values based on parameter range (supports dynamic _field names)
    let clampedValue = value
    switch (parameter) {
      case 'temperature':
      case 'soil_temp':
        clampedValue = Math.max(15, Math.min(30, value))
        break
      case 'co2':
        clampedValue = Math.max(400, Math.min(1200, value))
        break
      case 'humidity':
      case 'soil_moisture':
        clampedValue = Math.max(0, Math.min(100, value))
        break
      case 'vpd':
        clampedValue = Math.max(0, Math.min(2, value))
        break
      case 'par':
      case 'par_estimated':
        clampedValue = Math.max(0, Math.min(1000, value))
        break
      case 'soil_conductivity':
      case 'soilEC':
        clampedValue = Math.max(0, Math.min(3, value))
        break
      case 'battery_v':
      case 'voltage_v':
        clampedValue = Math.max(0, Math.min(5, value))
        break
      case 'rssi':
      case 'snr':
        clampedValue = Math.max(-120, Math.min(0, value))
        break
      default:
        clampedValue = Math.max(0, Math.min(100, value))
    }

    data.push({
      timestamp,
      value: clampedValue,
    })
  }

  return data
}
