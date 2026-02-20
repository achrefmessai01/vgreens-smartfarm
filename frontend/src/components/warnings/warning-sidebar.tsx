'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import type { Warning } from '@/lib/warning-types'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { FieldGroup } from '@/components/ui/field'
import {
  SensorNameField,
  ValueField,
  TimeStampField,
  TunnelField,
  StatusField,
} from './warning-sidebar-fields'

export interface WarningSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warning: Warning | null
  onAcknowledge?: (warning: Warning) => void
  onResolve?: (warning: Warning) => void
  isLoading?: boolean
}

export function WarningSidebar({
  open,
  onOpenChange,
  warning,
  onAcknowledge,
  onResolve,
  isLoading = false,
}: WarningSidebarProps) {
  const { t } = useI18n()

  const canAcknowledge = warning?.status === 'open'
  const canResolve = warning ? warning.status !== 'resolved' : false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
          <SheetTitle className="dark:text-card-foreground">
            {t.pages.warnings.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {warning ? (
            <FieldGroup>
              <SensorNameField
                sensorName={warning.sensorName}
                isLoading={isLoading}
              />
              <ValueField value={warning.value} isLoading={isLoading} />
              <TimeStampField
                timestamp={new Date(warning.timestamp).toLocaleString()}
                isLoading={isLoading}
              />
              <TunnelField tunnel={warning.tunnel} isLoading={isLoading} />
              <StatusField status={warning.status} isLoading={isLoading} />
            </FieldGroup>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t.pages.warnings.noWarningsDescription}
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
            {t.pages.users.cancel}
          </Button>

          {canAcknowledge && warning && onAcknowledge && (
            <Button
              variant="outline"
              onClick={() => onAcknowledge(warning)}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.warnings.acknowledge}
            </Button>
          )}

          {canResolve && warning && onResolve && (
            <Button
              onClick={() => onResolve(warning)}
              disabled={isLoading}
              className="flex-1"
            >
              {t.pages.warnings.resolve}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
