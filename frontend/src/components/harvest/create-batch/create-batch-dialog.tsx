'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import type { CreateHarvestMutation } from '@/generated/graphql';
import { CreateBatchFormFields } from './form/create-batch-form-fields';
import { useCreateBatchForm } from '@/lib/hooks/use-create-batch-form';

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (harvest: CreateHarvestMutation['createHarvest']) => void;
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBatchDialogProps) {
  const { t } = useI18n();
  const { formData, setFormData, errors, loading, reset, handleSubmit } =
    useCreateBatchForm({
      onSuccess: (harvest) => {
        onOpenChange(false);
        onCreated?.(harvest);
      },
    });

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) reset();
      onOpenChange(nextOpen);
    },
    [reset, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t.pages.harvest?.createNewBatch || 'Create New Batch'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.pages.harvest?.setUpNewBatch || 'Set up a new cultivation batch'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CreateBatchFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {t.pages.harvest?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? t.pages.harvest?.creating || 'Creating...'
                : t.pages.harvest?.createBatch || 'Create Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
