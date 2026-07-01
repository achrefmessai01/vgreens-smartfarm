'use client';

import * as React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
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
import type { EditBatchHarvest } from '@/lib/hooks/use-edit-harvest';
import { formatHarvestDate, formatTimeOfDay } from '@/lib/harvest-utils';
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
  // Input-mode switch: whether the mode toggle differs from the loaded value (a
  // switch converts every harvest entry in the batch), whether it's a weight ->
  // crate switch (so a crate is picked per harvest), and whether any harvest
  // still needs a crate. The batch's harvests + chosen crates drive the pickers.
  modeChanged?: boolean;
  switchingToCrate?: boolean;
  needsCrate?: boolean;
  harvests?: EditBatchHarvest[];
  crateByHarvest?: Record<string, { id: string; weight: number }>;
  onCrateForHarvest?: (harvestId: string, crateId: string, weight: number) => void;
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
  switchingToCrate = false,
  needsCrate = false,
  harvests = [],
  crateByHarvest = {},
  onCrateForHarvest,
}: EditHarvestDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  // Inline confirmation for a mode switch. Kept INSIDE the sheet (not a separate
  // dialog): a nested modal renders in its own layer, so clicking it counts as
  // an outside interaction and dismisses the sheet (resetting state) before the
  // submit runs.
  const [confirming, setConfirming] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setConfirming(false);
        onReset();
      }
      onOpenChange(nextOpen);
    },
    [onReset, onOpenChange],
  );

  // Switching the mode rewrites every harvest entry in the batch, so confirm it
  // first (inline). A plain metadata edit (mode unchanged) saves straight away.
  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (readOnly) return;
      if (modeChanged) {
        setConfirming(true);
        return;
      }
      onSubmit();
    },
    [readOnly, modeChanged, onSubmit],
  );

  const handleConfirmConvert = React.useCallback(() => {
    setConfirming(false);
    onSubmit();
  }, [onSubmit]);

  // Human label for a harvest row in the per-harvest crate picker: its date plus
  // start time when set, so harvests on the same day are still distinguishable.
  const harvestLabel = React.useCallback((harvest: EditBatchHarvest) => {
    const time = formatTimeOfDay(harvest.startTime);
    const date = formatHarvestDate(harvest.date);
    return time ? `${date} · ${time}` : date;
  }, []);

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
              {/* Mode toggle is unlocked here (unlike creation's lock):
                  switching it converts the batch's harvest entries on save. */}
              <CreateBatchFormFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={readOnly}
              />
            </div>

            {/* Per-harvest crate pickers for a weight -> crate switch: crate mode
                derives kg from a crate weight, so each harvest picks the crate its
                counts are measured in before converting. */}
            {switchingToCrate && !readOnly && (
              <div className="bg-card space-y-3 rounded-xl border p-3 shadow-sm sm:p-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">
                    {h?.chooseCratePerHarvest ??
                      'Choose a crate for each harvest'}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {h?.convertModeDescription ??
                      'This converts every harvest entry in this batch to the new input mode. You can switch back at any time.'}
                  </p>
                </div>
                {harvests.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {h?.noHarvestsToConvert ??
                      'This batch has no harvests to convert yet.'}
                  </p>
                ) : (
                  harvests.map((harvest) => (
                    <div key={harvest.id} className="space-y-1.5">
                      <span className="text-muted-foreground text-xs font-medium">
                        {harvestLabel(harvest)}
                      </span>
                      <CrateSelectField
                        value={crateByHarvest[harvest.id]?.id ?? null}
                        onSelect={(id, weight) =>
                          onCrateForHarvest?.(harvest.id, id, weight)
                        }
                        error={
                          needsCrate && !crateByHarvest[harvest.id]
                            ? (h?.selectCrateToConvert ??
                              'Select a crate to convert')
                            : undefined
                        }
                        disabled={loading}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <SheetFooter className="bg-background/95 dark:border-primary-foreground/30 gap-2 border-t px-4 py-4 backdrop-blur-sm sm:px-6">
            {confirming && !readOnly ? (
              // Inline confirm step for the batch-wide conversion.
              <div className="w-full space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {h?.convertModeDescription ??
                      'This converts every harvest entry in this batch to the new input mode. You can switch back at any time.'}
                  </span>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {h?.cancel ?? 'Cancel'}
                  </Button>
                  <WriteActionButton
                    type="button"
                    onClick={handleConfirmConvert}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading
                      ? (h?.updating ?? 'Updating...')
                      : (h?.convertModeConfirm ?? 'Convert')}
                  </WriteActionButton>
                </div>
              </div>
            ) : (
              <>
                {!readOnly && (
                  <WriteActionButton
                    type="submit"
                    disabled={loading || needsCrate}
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
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
