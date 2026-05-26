'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';

interface ErrorReportDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  reportTitle: string;
}

export function ErrorReportDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  reportTitle,
}: ErrorReportDeleteDialogProps) {
  const { t } = useI18n();
  const deleteT = t.pages.admin.reports.deleteDialog;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deleteT.title}</DialogTitle>
          <DialogDescription>
            {deleteT.description} {reportTitle ? `"${reportTitle}"` : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {deleteT.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t.common.loading : deleteT.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
