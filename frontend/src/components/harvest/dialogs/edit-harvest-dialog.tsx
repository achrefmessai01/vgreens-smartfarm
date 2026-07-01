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
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { InputMode } from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { CreateBatchFormFields } from '../create-batch/form/create-batch-form-fields';
import { CrateSelectField } from '../batch-sidebar/fields/crate-select-field';

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
  // Input-mode switch: whether the mode toggle differs from the loaded value
  // (a switch converts every harvest entry in the batch), whether a crate still
  // needs picking for a weight -> crate switch, and the chosen crate.
  modeChanged?: boolean;
  needsCrate?: boolean;
  crateId?: string | null;
  onCrateSelect?: (crateId: string, weight: number) => void;
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
  modeChanged = false,
  needsCrate = false,
  crateId,
  onCrateSelect,
}: EditHarvestDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setConfirmOpen(false);
        onReset();
      }
      onOpenChange(nextOpen);
    },
    [onReset, onOpenChange],
  );

  // A weight -> crate switch needs a crate before it can be converted; surface
  // the picker inline once the user selects crate mode.
  const switchingToCrate = modeChanged && formData.inputMode === InputMode.Crate;

  // Switching the mode rewrites every harvest entry in the batch, so confirm it
  // first. A plain metadata edit (mode unchanged) saves straight away.
  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (readOnly) return;
      if (modeChanged) {
        setConfirmOpen(true);
        return;
      }
      onSubmit();
    },
    [readOnly, modeChanged, onSubmit],
  );

  const handleConfirmConvert = React.useCallback(() => {
    setConfirmOpen(false);
    onSubmit();
  }, [onSubmit]);

  return (
    <>
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

          <form
            onSubmit={handleFormSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {batchNumber && (
                <div className="mb-4 space-y-2">
                  <label className="text-sm font-medium">
                    {h?.batchNumber ?? 'Batch Number'}
                  </label>
                  <div className="border-input bg-muted/40 text-muted-foreground flex h-10 w-full items-center rounded-md border px-3 font-mono text-sm">
                    {batchNumber}
                  </div>
                </div>
              )}
              {/* Mode toggle is unlocked here (unlike creation's lock): switching
                  it converts the batch's harvest entries via onSubmit. */}
              <CreateBatchFormFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={readOnly}
              />
              {/* Crate picker for a weight -> crate switch: crate mode derives kg
                  from a crate weight, so one must be chosen before converting. */}
              {switchingToCrate && !readOnly && (
                <div className="mt-4">
                  <CrateSelectField
                    value={crateId ?? null}
                    onSelect={(id, weight) => onCrateSelect?.(id, weight)}
                    error={
                      needsCrate
                        ? (h?.selectCrateToConvert ?? 'Select a crate to convert')
                        : undefined
                    }
                    disabled={loading}
                  />
                </div>
              )}
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
                  disabled={loading || needsCrate}
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

      {/* Confirm the batch-wide conversion before it runs — it rewrites every
          harvest entry in the batch, not just one. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {h?.convertModeTitle ?? 'Switch input mode?'}
            </DialogTitle>
            <DialogDescription>
              {h?.convertModeDescription ??
                'This converts every harvest entry in this batch to the new input mode. You can switch back at any time.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              {h?.cancel ?? 'Cancel'}
            </Button>
            <Button onClick={handleConfirmConvert} disabled={loading}>
              {loading
                ? (h?.updating ?? 'Updating...')
                : (h?.convertModeConfirm ?? 'Convert')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
