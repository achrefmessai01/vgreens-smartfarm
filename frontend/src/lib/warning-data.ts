import type { Warning, Alert, WarningStatus } from './warning-types'

// In-memory storage for demo purposes
// In a real app, this would be replaced with API calls

let warnings: Warning[] = [
  {
    id: '1',
    sensorName: 'Temperature Sensor A1',
    value: '28.5°C',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 1',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    sensorName: 'Humidity Sensor B2',
    value: '85%',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 2',
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    sensorName: 'CO2 Sensor C3',
    value: '450 ppm',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 1',
    status: 'resolved',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    sensorName: 'Light Sensor D4',
    value: '1200 lux',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 3',
    status: 'open',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

let alerts: Alert[] = [
  {
    id: '1',
    sensorName: 'Temperature Sensor A1',
    value: '35.2°C',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 1',
    status: 'open',
    severity: 'critical',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    sensorName: 'Water Level Sensor E5',
    value: '5%',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 2',
    status: 'acknowledged',
    severity: 'critical',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    sensorName: 'pH Sensor F6',
    value: '3.2',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    tunnel: 'Tunnel 1',
    status: 'open',
    severity: 'critical',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
]

export function getAllWarnings(): Warning[] {
  return [...warnings]
}

export function getWarningsByStatus(status: WarningStatus | 'all'): Warning[] {
  if (status === 'all') {
    return warnings
  }
  return warnings.filter((warning) => warning.status === status)
}

export function updateWarningStatus(
  id: string,
  status: WarningStatus
): Warning | null {
  const warningIndex = warnings.findIndex((warning) => warning.id === id)
  if (warningIndex === -1) {
    return null
  }

  warnings[warningIndex] = {
    ...warnings[warningIndex],
    status,
    updatedAt: new Date().toISOString(),
  }
  return warnings[warningIndex]
}

export function getAllAlerts(): Alert[] {
  return [...alerts]
}

export function getAlertsByStatus(status: WarningStatus | 'all'): Alert[] {
  if (status === 'all') {
    return alerts
  }
  return alerts.filter((alert) => alert.status === status)
}

export function updateAlertStatus(
  id: string,
  status: WarningStatus
): Alert | null {
  const alertIndex = alerts.findIndex((alert) => alert.id === id)
  if (alertIndex === -1) {
    return null
  }

  alerts[alertIndex] = {
    ...alerts[alertIndex],
    status,
    updatedAt: new Date().toISOString(),
  }
  return alerts[alertIndex]
}

