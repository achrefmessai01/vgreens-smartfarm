import type { ParameterType, HistoryDataPoint } from './farm-types'

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

  // Generate base value based on parameter
  const getBaseValue = (index: number, total: number): number => {
    const progress = index / total
    switch (parameter) {
      case 'fruitLoad':
        // 0 to 13 range
        return 5 + Math.sin(progress * Math.PI * 2) * 4 + Math.random() * 2
      case 'canopyCover':
        // 0 to 1000 sq cm range
        return (
          400 + Math.sin(progress * Math.PI * 2) * 200 + Math.random() * 100
        )
      case 'energyBalance':
        // -100 to 100 range
        return Math.sin(progress * Math.PI * 2) * 50 + Math.random() * 20
      case 'temperature':
        // 19-22°C range
        return 20.5 + Math.sin(progress * Math.PI * 2) * 1 + Math.random() * 0.5
      case 'humidity':
        // 0-100 range
        return 70 + Math.sin(progress * Math.PI * 2) * 15 + Math.random() * 10
      default:
        return 50 + Math.random() * 50
    }
  }

  for (let i = 0; i < pointCount; i++) {
    const timestamp = new Date(now.getTime() - (pointCount - i) * intervalMs)
    const value = getBaseValue(i, pointCount)

    // Clamp values based on parameter range
    let clampedValue = value
    switch (parameter) {
      case 'fruitLoad':
        clampedValue = Math.max(0, Math.min(13, value))
        break
      case 'canopyCover':
        clampedValue = Math.max(0, Math.min(1000, value))
        break
      case 'energyBalance':
        clampedValue = Math.max(-100, Math.min(100, value))
        break
      case 'temperature':
        clampedValue = Math.max(19, Math.min(22, value))
        break
      case 'humidity':
        clampedValue = Math.max(0, Math.min(100, value))
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
