'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { useI18n } from '@/i18n';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  /**
   * When `true`, skip the view-only write guard on the confirm button. Set
   * this for confirmations that VGREENS_MEMBER is allowed to perform, such
   * as acknowledging or resolving an alert.
   */
  readOnlyExempt?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
  readOnlyExempt = false,
  children,
}: ConfirmationDialogProps) {
  const ConfirmButton = readOnlyExempt ? Button : WriteActionButton;
  const { t } = useI18n();
  const resolvedConfirmLabel = confirmLabel ?? t.common.confirm;
  const resolvedCancelLabel = cancelLabel ?? t.common.cancel;
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    // Note: The parent component should handle closing the dialog
    // after the confirmation action is complete
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="dark:text-card-foreground text-left">
            {title}
          </DialogTitle>
          <DialogDescription className="dark:text-muted-foreground/90 text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 sm:flex-1"
          >
            {resolvedCancelLabel}
          </Button>
          <ConfirmButton
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className="sm:flex-1"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                {resolvedConfirmLabel}
              </span>
            ) : (
              resolvedConfirmLabel
            )}
          </ConfirmButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
