'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import type { Alert } from '@/generated/graphql';
import { ConfirmationDialog } from '@/components/users';

interface AlertDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AlertDeleteDialog({
  open,
  onOpenChange,
  alert,
  onConfirm,
  onCancel,
  isLoading = false,
}: AlertDeleteDialogProps) {
  const { t } = useI18n();

  if (!alert) return null;

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.pages.alerts.deleteAlert}
      description="Are you sure you want to delete this alert? This action cannot be undone."
      confirmLabel={t.pages.alerts.delete}
      cancelLabel={t.pages.alerts.cancel}
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <div className="space-y-4">
        <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
          <p className="dark:text-card-foreground font-medium">
            {alert.sensorName}
          </p>
          <p className="text-muted-foreground dark:text-muted-foreground/80 mt-1 text-sm">
            {t.pages.alerts.value}: {alert.value}
          </p>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
