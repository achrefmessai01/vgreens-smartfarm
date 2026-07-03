'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { useI18n } from '@/i18n';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { CreateBatchFormFields } from '../create-batch/form/create-batch-form-fields';

// Edits the parent BATCH's planting metadata. The yield input mode (and the
// weight <-> crate conversion) is per-HARVEST and lives in the harvest sidebar,
// so this dialog carries no mode-switch machinery.
interface EditHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  loading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
  readOnly?: boolean;
  // Auto-generated, frozen batch identifier. Shown read-only above the form;
  // not part of the editable BatchFormData.
  batchNumber?: string | null;
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
  batchNumber,
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

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (readOnly) return;
      onSubmit();
    },
    [readOnly, onSubmit],
  );

  const badgeLabel = readOnly
    ? (h?.batchDetails ?? 'Batch Details')
    : (h?.editBatchTitle ?? 'Edit Batch');

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 flex w-full max-w-full flex-col gap-0 p-0 backdrop-blur-sm sm:max-w-2xl lg:max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="flex h-full min-h-0 flex-col">
          <SheetHeader className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary-foreground/30 border-b bg-gradient-to-r px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4" />
              <Badge variant="secondary" className="text-[10px] uppercase">
                {badgeLabel}
              </Badge>
            </div>
            <SheetTitle className="dark:text-card-foreground pr-8 text-left leading-tight break-words">
              {readOnly
                ? (h?.viewBatchFormDetails ?? 'View batch form details.')
                : (h?.editBatchDescription ?? 'Update batch details.')}
            </SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
            {batchNumber && (
              <div className="bg-card space-y-2 rounded-xl border p-3 shadow-sm sm:p-4">
                <label className="text-sm font-medium">
                  {h?.batchNumber ?? 'Batch Number'}
                </label>
                <div className="border-input bg-muted/40 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 font-mono text-sm">
                  {batchNumber}
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border p-3 shadow-sm sm:p-4">
              <CreateBatchFormFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={readOnly}
              />
            </div>
          </div>

          <SheetFooter className="bg-background/95 dark:border-primary-foreground/30 gap-2 border-t px-4 py-4 backdrop-blur-sm sm:px-6">
            {!readOnly && (
              <WriteActionButton
                type="submit"
                disabled={loading}
                className="h-12 w-full text-base font-semibold shadow-sm sm:text-lg"
                size="lg"
              >
                {loading
                  ? (h?.updating ?? 'Updating...')
                  : (h?.update ?? 'Update')}
              </WriteActionButton>
            )}
            <Button
              type="button"
              variant="outline"
              className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 w-full"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {readOnly ? (h?.close ?? 'Close') : (h?.cancel ?? 'Cancel')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
