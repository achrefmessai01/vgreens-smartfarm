'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Alert } from '@/generated/graphql'
import { ConfirmationDialog } from '@/components/users'

interface AlertActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert: Alert | null
  action: 'acknowledge' | 'resolve' | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function AlertActionDialog({
  open,
  onOpenChange,
  alert,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: AlertActionDialogProps) {
  const { t } = useI18n()

  const getTitle = () => {
    if (action === 'acknowledge') {
      return t.pages.alerts.acknowledgeAlert
    }
    return t.pages.alerts.resolveAlert
  }

  const getDescription = () => {
    if (action === 'acknowledge') {
      return t.pages.alerts.acknowledgeDescription
    }
    return t.pages.alerts.resolveDescription
  }

  const getConfirmLabel = () => {
    if (action === 'acknowledge') {
      return t.pages.alerts.acknowledge
    }
    return t.pages.alerts.resolve
  }

  if (!alert) return null

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={getTitle()}
      description={getDescription()}
      confirmLabel={getConfirmLabel()}
      cancelLabel={t.pages.alerts.cancel}
      variant="default"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 ml-auto" />
            </div>
            <Skeleton className="h-4 w-44 mt-1" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="font-medium dark:text-card-foreground">
                {alert.sensorName}
              </p>
              <Badge variant="destructive" className="ml-auto">
                {t.pages.alerts.critical}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
              {t.pages.alerts.value}: {alert.value}
            </p>
          </div>
        </div>
      )}
    </ConfirmationDialog>
  )
}
