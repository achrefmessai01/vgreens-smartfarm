'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Alert, AlertSeverity, AlertStatus } from '@/generated/graphql'
import {
  SensorNameField,
  ValueField,
  StatusField,
  SeverityField,
  TimeStampField,
  DescriptionField,
  AcknowledgedByField,
  ResolvedByField,
} from './alert-sidebar-fields'

export interface AlertSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert: Alert | null
  onAcknowledge?: (alert: Alert) => void
  onResolve?: (alert: Alert) => void
  isLoading?: boolean
}

export function AlertSidebar({
  open,
  onOpenChange,
  alert,
  onAcknowledge,
  onResolve,
  isLoading = false,
}: AlertSidebarProps) {
  const { t } = useI18n()

  const canAcknowledge = alert?.status === AlertStatus.Open
  const canResolve =
    alert?.status === AlertStatus.Open ||
    alert?.status === AlertStatus.Acknowledged

  const getStatusLabel = (status?: AlertStatus | null) => {
    switch (status) {
      case AlertStatus.Open:
        return t.pages.alerts.statusOpen
      case AlertStatus.Acknowledged:
        return t.pages.alerts.statusAcknowledged
      case AlertStatus.Resolved:
        return t.pages.alerts.statusResolved
      default:
        return '-'
    }
  }

  const getSeverityLabel = (severity?: AlertSeverity | null) => {
    switch (severity) {
      case AlertSeverity.Critical:
        return t.pages.alerts.critical
      default:
        return severity ?? '-'
    }
  }

  const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
  }

  const formatUser = (user?: Alert['acknowledgedBy']) => {
    if (!user) return '-'
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    return name || user.email || '-'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
          <SheetTitle className="dark:text-card-foreground">
            {t.pages.alerts.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {alert ? (
            <FieldGroup>
              <SensorNameField
                sensorName={alert.sensorName}
                isLoading={isLoading}
              />
              <ValueField value={alert.value} isLoading={isLoading} />
              <StatusField
                status={getStatusLabel(alert.status)}
                isLoading={isLoading}
              />
              <SeverityField
                severity={getSeverityLabel(alert.severity)}
                isLoading={isLoading}
              />
              <TimeStampField
                timestamp={formatTimestamp(alert.timestamp)}
                isLoading={isLoading}
              />
              <DescriptionField
                description={alert.description || '-'}
                isLoading={isLoading}
              />
              <AcknowledgedByField
                acknowledgedBy={formatUser(alert.acknowledgedBy)}
                isLoading={isLoading}
              />
              <ResolvedByField
                resolvedBy={formatUser(alert.resolvedBy)}
                isLoading={isLoading}
              />
            </FieldGroup>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t.pages.alerts.noAlertsDescription}
            </p>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
          >
            {t.pages.alerts.cancel}
          </Button>

          {canAcknowledge && alert && onAcknowledge && (
            <Button
              variant="outline"
              onClick={() => onAcknowledge(alert)}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.alerts.acknowledge}
            </Button>
          )}

          {canResolve && alert && onResolve && (
            <Button
              onClick={() => onResolve(alert)}
              disabled={isLoading}
              className="flex-1"
            >
              {t.pages.alerts.resolve}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
