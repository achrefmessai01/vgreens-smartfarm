import * as React from 'react'
import { AlertTriangle, CheckCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertSeverity, AlertStatus, User } from '@/generated/graphql'
import { useI18n } from '@/i18n'

export type AlertTableUser = Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>

/**
 * Formatting utilities for alert table display
 */

export const getStatusBadge = (status: AlertStatus, t: ReturnType<typeof useI18n>['t']) => {
  switch (status) {
    case AlertStatus.Open:
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t.pages.alerts.statusOpen}
        </Badge>
      )
    case AlertStatus.Acknowledged:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <CheckCircle2 className="h-3 w-3" />
          {t.pages.alerts.statusAcknowledged}
        </Badge>
      )
    case AlertStatus.Resolved:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {t.pages.alerts.statusResolved}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const getSeverityBadge = (severity: AlertSeverity, t: ReturnType<typeof useI18n>['t']) => {
  switch (severity) {
    case AlertSeverity.Critical:
      return <Badge variant="destructive">{t.pages.alerts.critical}</Badge>
    default:
      return <Badge variant="outline">{severity}</Badge>
  }
}

export const getRowClassName = (alert: Alert): string => {
  if (alert.status === AlertStatus.Resolved) {
    return 'bg-emerald-50/70 dark:bg-emerald-950/30'
  }

  if (alert.status === AlertStatus.Acknowledged) {
    return 'bg-amber-50/60 dark:bg-amber-950/20'
  }

  if (alert.status === AlertStatus.Open && alert.severity === AlertSeverity.Critical) {
    return 'bg-red-50/80 dark:bg-red-950/40'
  }

  return ''
}

export const formatTimestamp = (timestamp?: Alert['timestamp'] | null): string => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

export const getTimestampMs = (timestamp?: Alert['timestamp'] | null): number => {
  if (!timestamp) return 0
  const time = new Date(timestamp).getTime()
  return Number.isNaN(time) ? 0 : time
}

export const formatFieldLabel = (field?: string | null): string => {
  if (!field) return '-'

  const labels: Record<string, string> = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    vpd: 'VPD',
    soil_moisture: 'Soil moisture',
    soil_ec: 'Soil EC',
    soil_temp: 'Soil temp',
    par: 'PAR',
    co2: 'CO2',
  }

  return (
    labels[field] ??
    field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

export const formatUser = (user?: Alert['acknowledgedBy']): string => {
  if (!user) return '-'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return name || user.email || '-'
}

/**
 * Create user options for multi-select filters
 */
export const createUserOptions = (users: AlertTableUser[]) => {
  return users.map((user) => {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      user.id

    return { label: name, value: user.id }
  })
}