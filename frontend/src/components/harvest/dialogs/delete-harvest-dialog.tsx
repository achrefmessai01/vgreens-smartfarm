'use client';

import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';

interface DeleteHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function DeleteHarvestDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  title,
  description,
  confirmLabel,
}: DeleteHarvestDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {title ?? h?.deleteHarvestTitle ?? 'Delete Harvest Record'}
          </DialogTitle>
          <DialogDescription>
            {description ??
              h?.deleteHarvestDescription ??
              'Are you sure you want to delete this harvest record? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {h?.cancel ?? 'Cancel'}
          </Button>
          <WriteActionButton
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? (h?.deleting ?? 'Deleting...')
              : (confirmLabel ?? h?.confirmDelete ?? 'Delete')}
          </WriteActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
