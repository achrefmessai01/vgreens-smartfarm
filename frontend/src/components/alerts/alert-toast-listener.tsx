'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertStatus,
  type AlertsQuery,
  type User,
  UserRole,
  useAlertsQuery,
  useTenantFeaturesQuery,
} from '@/generated/graphql'
import { useToast } from '@/components/ui/toast-provider'
import { useI18n } from '@/i18n'

const ALERT_POLL_INTERVAL_MS = 30000
const MAX_TRACKED_ALERTS = 200

type ToastableAlert = AlertsQuery['alerts'][number]

interface AlertToastListenerProps {
  user?: User
}

function formatFieldLabel(field?: string | null) {
  if (!field) {
    return null
  }

  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getAlertTimestamp(alert: ToastableAlert) {
  return alert.timestamp ?? alert.createdAt
}

function formatAlertDescription(alert: ToastableAlert, fallback: string) {
  const parts = [
    formatFieldLabel(alert.field),
    alert.value,
    alert.greenhouse,
    alert.description?.trim(),
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' | ') : fallback
}

export function AlertToastListener({ user }: AlertToastListenerProps) {
  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()
  const seenAlertIdsRef = React.useRef<Set<string>>(new Set())
  const hasInitializedRef = React.useRef(false)

  const tenantId = user?.tenantId
  const role = user?.role as UserRole | undefined
  const isTenantScopedUser = Boolean(tenantId) && role !== UserRole.VgreensAdmin

  const { data: tenantFeaturesData, loading: tenantFeaturesLoading } =
    useTenantFeaturesQuery({
      variables: { tenantId: tenantId || undefined },
      skip: !tenantId,
      fetchPolicy: 'cache-and-network',
    })

  const alertsFeatureEnabled = React.useMemo(() => {
    if (!tenantFeaturesData?.tenantFeatures) {
      return false
    }

    return tenantFeaturesData.tenantFeatures.some(
      (tenantFeature) =>
        tenantFeature.enabled &&
        tenantFeature.feature?.isActive &&
        tenantFeature.feature?.key === 'sensor_alerts'
    )
  }, [tenantFeaturesData])

  const canWatchAlerts =
    isTenantScopedUser && !tenantFeaturesLoading && alertsFeatureEnabled

  const { data } = useAlertsQuery({
    variables: {
      filter: {
        status: AlertStatus.Open,
      },
    },
    skip: !canWatchAlerts,
    pollInterval: ALERT_POLL_INTERVAL_MS,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  })

  React.useEffect(() => {
    seenAlertIdsRef.current.clear()
    hasInitializedRef.current = false
  }, [tenantId, canWatchAlerts])

  React.useEffect(() => {
    if (!canWatchAlerts || !data?.alerts) {
      return
    }

    const openAlerts = data.alerts.filter(
      (alert) => alert.status === AlertStatus.Open
    )

    if (!hasInitializedRef.current) {
      seenAlertIdsRef.current = new Set(openAlerts.map((alert) => alert.id))
      hasInitializedRef.current = true
      return
    }

    const unseenAlerts = openAlerts
      .filter((alert) => !seenAlertIdsRef.current.has(alert.id))
      .sort((left, right) => {
        const leftTimestamp = new Date(getAlertTimestamp(left)).getTime()
        const rightTimestamp = new Date(getAlertTimestamp(right)).getTime()

        return leftTimestamp - rightTimestamp
      })

    unseenAlerts.forEach((alert) => {
      seenAlertIdsRef.current.add(alert.id)

      toast({
        id: `alert-${alert.id}`,
        title: `${t.pages.alerts.toastTitle}: ${alert.sensorName}`,
        description: formatAlertDescription(
          alert,
          t.pages.alerts.toastFallbackDescription
        ),
        variant: 'destructive',
        duration: 12000,
        action: {
          label: t.pages.alerts.toastViewAction,
          onClick: () => router.push('/tenant/alerts'),
        },
      })
    })

    if (seenAlertIdsRef.current.size > MAX_TRACKED_ALERTS) {
      seenAlertIdsRef.current = new Set(
        Array.from(seenAlertIdsRef.current).slice(-MAX_TRACKED_ALERTS)
      )
    }
  }, [canWatchAlerts, data, router, t.pages.alerts, toast])

  return null
}
