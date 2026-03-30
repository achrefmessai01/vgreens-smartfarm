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
    if (deleteConfirmation.alert) {
      const success = await management.handleDelete(
        deleteConfirmation.alert.id,
      );
      if (success) setDeleteConfirmation({ alert: null, isOpen: false });
    }
  }, [deleteConfirmation.alert, management]);

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
    confirmAction,
    handleSubmit,
    handleCancel,
  };
}
