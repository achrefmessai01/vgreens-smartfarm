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
      <DialogContent className="flex max-h-[min(720px,90dvh)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md lg:max-w-lg">
        <DialogHeader className="border-b px-4 pt-5 pb-4 sm:px-6">
          <DialogTitle className="pr-8 leading-tight">
            {readOnly
              ? (h?.batchDetails ?? 'Batch Details')
              : (h?.editBatchTitle ?? 'Edit Batch')}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? (h?.viewBatchFormDetails ?? 'View batch form details.')
              : (h?.editBatchDescription ?? 'Update batch details.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <CreateBatchFormFields
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              disabled={readOnly}
            />
          </div>

          <div className="bg-background/95 flex flex-col-reverse gap-2 border-t px-4 py-4 backdrop-blur-sm sm:flex-row sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {readOnly ? (h?.close ?? 'Close') : (h?.cancel ?? 'Cancel')}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
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
