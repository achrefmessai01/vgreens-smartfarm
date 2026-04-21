'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { CreateBatchFormFields } from '../create-batch/form/create-batch-form-fields';

interface EditHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  readOnly?: boolean;
}

export function EditHarvestDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  errors,
  loading,
  onSubmit,
  onReset,
  readOnly = false,
}: EditHarvestDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onReset();
      onOpenChange(nextOpen);
    },
    [onReset, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {readOnly
              ? (h?.batchDetails ?? 'Batch Details')
              : (h?.editHarvest ?? 'Edit Harvest')}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? 'View batch form details.'
              : (h?.editHarvestDescription ?? 'Update the harvest record details.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <CreateBatchFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            disabled={readOnly}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {readOnly ? (h?.close ?? 'Close') : (h?.cancel ?? 'Cancel')}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={loading}>
                {loading
                  ? (h?.updating ?? 'Updating...')
                  : (h?.update ?? 'Update')}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
