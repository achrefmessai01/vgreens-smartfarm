'use client';

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

interface DeleteHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteHarvestDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DeleteHarvestDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {h?.deleteHarvestTitle ?? 'Delete Harvest Record'}
          </DialogTitle>
          <DialogDescription>
            {h?.deleteHarvestDescription ??
              'Are you sure you want to delete this harvest record? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {h?.cancel ?? 'Cancel'}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading
              ? (h?.deleting ?? 'Deleting...')
              : (h?.confirmDelete ?? 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
