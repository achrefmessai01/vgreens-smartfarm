'use client'

import {
  AlertTable,
  AlertFormSheet,
  AlertPageHeader,
  AlertActionDialog,
  AlertDeleteDialog,
  AlertSidebar,
} from '@/components/alerts'
import * as React from 'react'
import { useI18n } from '@/i18n'
import type { Alert } from '@/generated/graphql'
import { FeatureGuard } from '@/components/features/feature-guard'
import { useAlertManagement } from '@/lib/hooks/use-alert-management'

export default function AlertsPage() {
  const { t } = useI18n()
  const {
    alerts,
    loading,
    isLoading,
    openAlertsCount,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAcknowledge,
    handleResolve,
  } = useAlertManagement()

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingAlert, setEditingAlert] = React.useState<Alert | null>(null)
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    alert: Alert | null
    isOpen: boolean
  }>({ alert: null, isOpen: false })
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean
    alert: Alert | null
    action: 'acknowledge' | 'resolve' | null
  }>({ isOpen: false, alert: null, action: null })

  const onCreate = () => {
    setSelectedAlert(null)
    setEditingAlert(null)
    setIsSheetOpen(true)
  }

  const onEdit = (alert: Alert) => {
    setSelectedAlert(null)
    setEditingAlert(alert)
    setIsSheetOpen(true)
  }

  const onDelete = (alert: Alert) => {
    setDeleteConfirmation({ alert, isOpen: true })
  }

  const onAcknowledge = (alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'acknowledge' })
  }

  const onResolve = (alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'resolve' })
  }

  const handleAlertRowClick = (alert: Alert) => {
    setSelectedAlert(alert)
  }

  const handleSidebarOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedAlert(null)
    }
  }

  const handleSidebarAcknowledge = (alert: Alert) => {
    setSelectedAlert(null)
    onAcknowledge(alert)
  }

  const handleSidebarResolve = (alert: Alert) => {
    setSelectedAlert(null)
    onResolve(alert)
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.alert) {
      const success = await handleDelete(deleteConfirmation.alert.id)
      if (success) {
        setDeleteConfirmation({ alert: null, isOpen: false })
      }
    }
  }

  const confirmAction = async () => {
    if (actionDialog.alert && actionDialog.action) {
      const success =
        actionDialog.action === 'acknowledge'
          ? await handleAcknowledge(actionDialog.alert.id)
          : await handleResolve(actionDialog.alert.id)
      if (success) {
        setActionDialog({ isOpen: false, alert: null, action: null })
      }
    }
  }

  const handleSubmit = async (formData: {
    sensorName: string
    value: string
    description?: string
  }) => {
    const success = editingAlert
      ? await handleUpdate(editingAlert.id, formData)
      : await handleCreate(formData)
    if (success) {
      setIsSheetOpen(false)
      setEditingAlert(null)
    }
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
    setEditingAlert(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <FeatureGuard featureKey="sensor_alerts">
      <div className="space-y-6">
        <AlertPageHeader
          openAlertsCount={openAlertsCount}
          onCreate={onCreate}
          isLoading={isLoading}
        />

        <AlertTable
          alerts={alerts}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          onEdit={onEdit}
          onDelete={onDelete}
          onRowClick={handleAlertRowClick}
          isLoading={isLoading}
        />

        <AlertSidebar
          open={selectedAlert !== null}
          onOpenChange={handleSidebarOpenChange}
          alert={selectedAlert}
          onAcknowledge={handleSidebarAcknowledge}
          onResolve={handleSidebarResolve}
          isLoading={isLoading}
        />

        <AlertFormSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          alert={editingAlert}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />

        <AlertActionDialog
          open={actionDialog.isOpen}
          onOpenChange={(open) =>
            setActionDialog({ isOpen: open, alert: null, action: null })
          }
          alert={actionDialog.alert}
          action={actionDialog.action}
          onConfirm={confirmAction}
          onCancel={() =>
            setActionDialog({ isOpen: false, alert: null, action: null })
          }
          isLoading={isLoading}
        />

        <AlertDeleteDialog
          open={deleteConfirmation.isOpen}
          onOpenChange={(open) =>
            setDeleteConfirmation({ alert: null, isOpen: open })
          }
          alert={deleteConfirmation.alert}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation({ alert: null, isOpen: false })}
          isLoading={isLoading}
        />
      </div>
    </FeatureGuard>
  )
}
