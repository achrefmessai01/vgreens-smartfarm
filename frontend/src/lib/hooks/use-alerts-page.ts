'use client';

import * as React from 'react';
import type { Alert } from '@/generated/graphql';
import { useAlertManagement } from '@/lib/hooks/use-alert-management';
import type { AlertsFilterInput } from '@/lib/alerts-filter';

export function useAlertsPage() {
  const [filter, setFilter] = React.useState<AlertsFilterInput>({});
  const management = useAlertManagement(filter);

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingAlert, setEditingAlert] = React.useState<Alert | null>(null);
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    alert: Alert | null;
    isOpen: boolean;
  }>({ alert: null, isOpen: false });
  const [hardDeleteEscalation, setHardDeleteEscalation] = React.useState<{
    alert: Alert | null;
    isOpen: boolean;
    reason: string;
  }>({ alert: null, isOpen: false, reason: '' });
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean;
    alert: Alert | null;
    action: 'acknowledge' | 'resolve' | null;
  }>({ isOpen: false, alert: null, action: null });

  const onFilterChange = React.useCallback(
    (updates: Partial<AlertsFilterInput>) => {
      setFilter((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const onCreate = React.useCallback(() => {
    setSelectedAlert(null);
    setEditingAlert(null);
    setIsSheetOpen(true);
  }, []);

  const onEdit = React.useCallback((alert: Alert) => {
    setSelectedAlert(null);
    setEditingAlert(alert);
    setIsSheetOpen(true);
  }, []);

  const onDelete = React.useCallback((alert: Alert) => {
    setDeleteConfirmation({ alert, isOpen: true });
  }, []);

  const onAcknowledge = React.useCallback((alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'acknowledge' });
  }, []);

  const onResolve = React.useCallback((alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'resolve' });
  }, []);

  const handleAlertRowClick = React.useCallback((alert: Alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleSidebarOpenChange = React.useCallback((open: boolean) => {
    if (!open) setSelectedAlert(null);
  }, []);

  const handleSidebarAcknowledge = React.useCallback((alert: Alert) => {
    setSelectedAlert(null);
    setActionDialog({ isOpen: true, alert, action: 'acknowledge' });
  }, []);

  const handleSidebarResolve = React.useCallback((alert: Alert) => {
    setSelectedAlert(null);
    setActionDialog({ isOpen: true, alert, action: 'resolve' });
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deleteConfirmation.alert) return;
    const target = deleteConfirmation.alert;
    const result = await management.handleSoftDelete(target.id);
    if (result.ok) {
      setDeleteConfirmation({ alert: null, isOpen: false });
    } else {
      // Soft-delete failed — escalate to a customer-friendly hard-delete
      // dialog that explains what just happened and the trade-off.
      setDeleteConfirmation({ alert: null, isOpen: false });
      setHardDeleteEscalation({
        alert: target,
        isOpen: true,
        reason: result.reason,
      });
    }
  }, [deleteConfirmation.alert, management]);

  const confirmHardDelete = React.useCallback(async () => {
    if (!hardDeleteEscalation.alert) return;
    const success = await management.handleHardDelete(
      hardDeleteEscalation.alert.id,
    );
    if (success)
      setHardDeleteEscalation({ alert: null, isOpen: false, reason: '' });
  }, [hardDeleteEscalation.alert, management]);

  const cancelHardDelete = React.useCallback(() => {
    setHardDeleteEscalation({ alert: null, isOpen: false, reason: '' });
  }, []);

  const confirmAction = React.useCallback(async () => {
    if (actionDialog.alert && actionDialog.action) {
      const success =
        actionDialog.action === 'acknowledge'
          ? await management.handleAcknowledge(actionDialog.alert.id)
          : await management.handleResolve(actionDialog.alert.id);
      if (success)
        setActionDialog({ isOpen: false, alert: null, action: null });
    }
  }, [actionDialog, management]);

  const handleSubmit = React.useCallback(
    async (formData: {
      sensorName: string;
      value: string;
      description?: string;
    }) => {
      const success = editingAlert
        ? await management.handleUpdate(editingAlert.id, formData)
        : await management.handleCreate(formData);
      if (success) {
        setIsSheetOpen(false);
        setEditingAlert(null);
      }
    },
    [editingAlert, management],
  );

  const handleCancel = React.useCallback(() => {
    setIsSheetOpen(false);
    setEditingAlert(null);
  }, []);

  return {
    ...management,
    filter,
    onFilterChange,
    isSheetOpen,
    setIsSheetOpen,
    editingAlert,
    selectedAlert,
    deleteConfirmation,
    setDeleteConfirmation,
    hardDeleteEscalation,
    setHardDeleteEscalation,
    actionDialog,
    setActionDialog,
    onCreate,
    onEdit,
    onDelete,
    onAcknowledge,
    onResolve,
    handleAlertRowClick,
    handleSidebarOpenChange,
    handleSidebarAcknowledge,
    handleSidebarResolve,
    confirmDelete,
    confirmHardDelete,
    cancelHardDelete,
    confirmAction,
    handleSubmit,
    handleCancel,
  };
}
