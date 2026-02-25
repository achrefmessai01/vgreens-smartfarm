'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { WarningTable } from '@/components/warnings'
import { WarningSidebar } from '@/components/warnings/warning-sidebar'
import { ConfirmationDialog } from '@/components/users'
import { PageHeader } from '@/components/layout/page-header'
import type { Warning, WarningStatus } from '@/lib/warning-types'
import { FeatureGuard } from '@/components/features/feature-guard'
import { getAllWarnings, updateWarningStatus } from '@/lib/warning-data'

export default function WarningsPage() {
  const { t } = useI18n()
  const [warnings, setWarnings] = React.useState<Warning[]>([])
  const [selectedWarning, setSelectedWarning] = React.useState<Warning | null>(
    null
  )
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean
    warning: Warning | null
    action: 'acknowledge' | 'resolve' | null
  }>({ isOpen: false, warning: null, action: null })

  React.useEffect(() => {
    setWarnings(getAllWarnings())
  }, [])

  const handleAcknowledge = (warning: Warning) => {
    setActionDialog({ isOpen: true, warning, action: 'acknowledge' })
  }

  const handleResolve = (warning: Warning) => {
    setActionDialog({ isOpen: true, warning, action: 'resolve' })
  }

  const handleSidebarAcknowledge = (warning: Warning) => {
    setSelectedWarning(null)
    handleAcknowledge(warning)
  }

  const handleSidebarResolve = (warning: Warning) => {
    setSelectedWarning(null)
    handleResolve(warning)
  }

  const handleWarningRowClick = (warning: Warning) => {
    setSelectedWarning(warning)
  }

  const handleSidebarOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedWarning(null)
    }
  }

  const confirmAction = () => {
    if (actionDialog.warning && actionDialog.action) {
      const newStatus: WarningStatus =
        actionDialog.action === 'acknowledge' ? 'acknowledged' : 'resolved'
      const updated = updateWarningStatus(actionDialog.warning.id, newStatus)

      if (updated) {
        setWarnings(getAllWarnings())
        setSelectedWarning((prev) => (prev?.id === updated.id ? updated : prev))
        setActionDialog({ isOpen: false, warning: null, action: null })
      }
    }
  }

  const getDialogTitle = () => {
    if (actionDialog.action === 'acknowledge') {
      return t.pages.warnings.acknowledgeWarning
    }
    return t.pages.warnings.resolveWarning
  }

  const getDialogDescription = () => {
    if (actionDialog.action === 'acknowledge') {
      return t.pages.warnings.acknowledgeDescription
    }
    return t.pages.warnings.resolveDescription
  }

  return (
    <FeatureGuard featureKey="sensor_alerts">
      <div className="space-y-6">
        <PageHeader
          title={t.pages.warnings.title}
          subtitle={t.pages.warnings.subtitle}
        />

        <WarningTable
          warnings={warnings}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onRowClick={handleWarningRowClick}
        />

        <WarningSidebar
          open={selectedWarning !== null}
          onOpenChange={handleSidebarOpenChange}
          warning={selectedWarning}
          onAcknowledge={handleSidebarAcknowledge}
          onResolve={handleSidebarResolve}
        />

        <ConfirmationDialog
          open={actionDialog.isOpen}
          onOpenChange={(open) =>
            setActionDialog({ isOpen: open, warning: null, action: null })
          }
          title={getDialogTitle()}
          description={getDialogDescription()}
          confirmLabel={
            actionDialog.action === 'acknowledge'
              ? t.pages.warnings.acknowledge
              : t.pages.warnings.resolve
          }
          cancelLabel={t.pages.users.cancel}
          variant="default"
          onConfirm={confirmAction}
          onCancel={() =>
            setActionDialog({ isOpen: false, warning: null, action: null })
          }
        >
          {actionDialog.warning && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
                <p className="font-medium dark:text-card-foreground">
                  {actionDialog.warning.sensorName}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {t.pages.warnings.value}: {actionDialog.warning.value}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {t.pages.warnings.tunnel}: {actionDialog.warning.tunnel}
                </p>
              </div>
            </div>
          )}
        </ConfirmationDialog>
      </div>
    </FeatureGuard>
  )
}
