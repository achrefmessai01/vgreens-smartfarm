'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import type { Alert } from '@/generated/graphql';
import { ConfirmationDialog } from '@/components/users';

interface AlertHardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  reason: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AlertHardDeleteDialog({
  open,
  onOpenChange,
  alert,
  reason,
  onConfirm,
  onCancel,
  isLoading = false,
}: AlertHardDeleteDialogProps) {
  const { t } = useI18n();

  if (!alert) return null;

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.pages.alerts.archiveFailed}
      description={t.pages.alerts.archiveFailedBody}
      confirmLabel={t.pages.alerts.removePermanently}
      cancelLabel={t.pages.alerts.keepAlert}
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="space-y-3">
        <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
          <p className="dark:text-card-foreground font-medium">
            {alert.sensorName}
          </p>
          <p className="text-muted-foreground dark:text-muted-foreground/80 mt-1 text-sm">
            {t.pages.alerts.value}: {alert.value}
          </p>
        </div>
        {reason && (
          <p className="text-muted-foreground text-xs">
            {t.pages.alerts.archiveFailedReason}: {reason}
          </p>
        )}
      </div>
    </ConfirmationDialog>
  );
}
