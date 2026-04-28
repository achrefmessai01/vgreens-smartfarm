import { useCallback, useState } from 'react';
import type { Alert } from '@/generated/graphql';
import { useAlertManagement } from '@/lib/hooks/use-alert-management';
import type { AlertsFilterInput } from '@/lib/alerts-filter';

export function useAlertsPage() {
  const [filter, setFilter] = useState<AlertsFilterInput>({});
  const management = useAlertManagement(filter);

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    alert: Alert | null;
    isOpen: boolean;
  }>({ alert: null, isOpen: false });
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    alert: Alert | null;
    action: 'acknowledge' | 'resolve' | null;
  }>({ isOpen: false, alert: null, action: null });

  const onFilterChange = useCallback(
    (updates: Partial<AlertsFilterInput>) => {
      setFilter((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const onDelete = useCallback((alert: Alert) => {
    setDeleteConfirmation({ alert, isOpen: true });
  }, []);

  const onAcknowledge = useCallback((alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'acknowledge' });
  }, []);

  const onResolve = useCallback((alert: Alert) => {
    setActionDialog({ isOpen: true, alert, action: 'resolve' });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.alert) {
      const success = await management.handleDelete(
        deleteConfirmation.alert.id,
      );
      if (success) {
        setDeleteConfirmation({ alert: null, isOpen: false });
        setSelectedAlert(null);
      }
    }
  }, [deleteConfirmation.alert, management]);

  const confirmAction = useCallback(async () => {
    if (actionDialog.alert && actionDialog.action) {
      const success =
        actionDialog.action === 'acknowledge'
          ? await management.handleAcknowledge(actionDialog.alert.id)
          : await management.handleResolve(actionDialog.alert.id);
      if (success) {
        setActionDialog({ isOpen: false, alert: null, action: null });
        setSelectedAlert(null);
      }
    }
  }, [actionDialog, management]);

  return {
    ...management,
    filter,
    onFilterChange,
    selectedAlert,
    setSelectedAlert,
    deleteConfirmation,
    setDeleteConfirmation,
    actionDialog,
    setActionDialog,
    onDelete,
    onAcknowledge,
    onResolve,
    confirmDelete,
    confirmAction,
  };
}
