'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetFooter,
  SheetContent,
} from '@/components/ui/sheet';
import {
  useBatchSidebar,
  type SidebarMode,
} from '@/lib/hooks/use-batch-sidebar';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CalendarDays, Sparkles } from 'lucide-react';
import { InputMode } from '@/generated/graphql';
import { PhotosField } from './fields/batch-sidebar-photos-field';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { entryHasData } from '@/types/batch-sidebar.types';
import { FieldMessage } from '@/components/harvest/field-message';
import { isTomatoSpecies } from '@/lib/harvest-utils';
import { HarvestEntryCard } from './fields/harvest-entry-card';
import { HarvestInputModeField } from './fields/input-mode-field';
import { CrateSelectField } from './fields/crate-select-field';

export interface BatchSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string | null;
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  initialDate?: string | null;
  initialStartTime?: string | null;
  initialStopTime?: string | null;
  initialHeadCount?: number | null;
  onCompleted?: () => void;
  isLoading?: boolean;
}

export function BatchSidebar({
  open,
  onOpenChange,
  batchId,
  harvestId,
  batchData,
  mode = 'create',
  initialDate,
  initialStartTime,
  initialStopTime,
  initialHeadCount,
  onCompleted,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const {
    currentData,
    loading: isSaving,
    canSave,
    harvestDate,
    setHarvestDate,
    startTime,
    setStartTime,
    stopTime,
    setStopTime,
    harvesterHeadCount,
    setHarvesterHeadCount,
    timingErrors,
    isCrateMode,
    crateError,
    handleCrateSelect,
    pendingMode,
    pendingCrate,
    pendingCrateMissing,
    converting,
    handleModeSelect,
    cancelModeSwitch,
    handlePendingCrateSelect,
    handleConfirmModeSwitch,
    confirmedWasteEntries,
    setWasteConfirmed,
    handleBrixChange,
    handleBrixClassChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleSampleWeightChange,
    handleSampleFruitCountChange,
    handleEntryChange,
    handleSetShowBrix,
    handleSetShowFruitWeight,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  } = useBatchSidebar({
    batchId,
    harvestId,
    batchData,
    mode,
    initialDate,
    initialStartTime,
    initialStopTime,
    initialHeadCount,
    onCompleted,
  });
  const todayIso = React.useMemo(
    () => new Date().toISOString().split('T')[0],
    [],
  );
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall through to focus fallback (Safari < 16, etc.)
      }
    }
    input.focus();
    input.click();
  };
  const friendlyDate = React.useMemo(
    () =>
      new Date(harvestDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [harvestDate],
  );

  const busy = isLoading || isSaving;
  // View mode renders the harvest read-only: the entry inputs are disabled via
  // a <fieldset> wrapper and the save action is hidden.
  const readOnly = mode === 'view';

  const buttonLabel = isSaving
    ? mode === 'edit'
      ? (h?.updating ?? 'Updating...')
      : (h?.saving ?? 'Saving...')
    : mode === 'edit'
      ? (h?.update ?? 'Update')
      : (h?.logHarvest ?? 'Log Harvest');

  const badgeLabel = readOnly
    ? (h?.viewDetails ?? 'View Details')
    : mode === 'edit'
      ? (h?.editHarvest ?? 'Edit Harvest')
      : (h?.logHarvest ?? 'Log Harvest');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 flex w-full max-w-full flex-col gap-0 p-0 backdrop-blur-sm sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary-foreground/30 border-b bg-gradient-to-r px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <Badge variant="secondary" className="text-[10px] uppercase">
              {badgeLabel}
            </Badge>
          </div>
          {/* Kept for dialog accessibility but visually hidden: the batch-detail
              header is intentionally not shown in the harvest sidebar. */}
          <SheetTitle className="sr-only">
            {currentData?.greenhouse?.name
              ? (h?.batchDetailsFor ?? '{label} for {greenhouse}')
                  .replace('{label}', h?.batchDetails ?? 'Batch Details')
                  .replace('{greenhouse}', currentData.greenhouse.name)
              : (h?.batchDetails ?? 'Batch Details')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {currentData ? (
            <>
              <fieldset
                disabled={readOnly}
                className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 disabled:opacity-90 sm:px-5 sm:py-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">
                    {h?.todaysHarvest ?? 'Today Harvest'}
                  </h3>
                  <button
                    type="button"
                    onClick={openDatePicker}
                    aria-label={h?.harvestDate ?? 'Harvest Date'}
                    className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70 focus-visible:ring-ring/40 focus-visible:ring-offset-background relative inline-flex h-7 w-fit cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{friendlyDate}</span>
                    <input
                      ref={dateInputRef}
                      id="harvestDate"
                      type="date"
                      value={harvestDate}
                      max={todayIso}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                    />
                  </button>
                </div>

                {/* Harvest-level session timing + labor: shared by every entry
                    in this harvest. Validation errors surface inline. */}
                <div className="bg-card grid grid-cols-1 gap-3 rounded-xl border p-3 shadow-sm sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="harvestStartTime"
                      className="text-sm font-medium"
                    >
                      {h?.startTime ?? 'Start Time'}
                    </Label>
                    <Input
                      id="harvestStartTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      aria-invalid={Boolean(timingErrors.startTime)}
                    />
                    <FieldMessage size="xs">
                      {timingErrors.startTime}
                    </FieldMessage>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="harvestStopTime"
                      className="text-sm font-medium"
                    >
                      {h?.stopTime ?? 'Stop Time'}
                    </Label>
                    <Input
                      id="harvestStopTime"
                      type="time"
                      value={stopTime}
                      onChange={(e) => setStopTime(e.target.value)}
                      aria-invalid={Boolean(timingErrors.stopTime)}
                    />
                    <FieldMessage size="xs">
                      {timingErrors.stopTime}
                    </FieldMessage>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="harvesterHeadCount"
                      className="text-sm font-medium"
                    >
                      {h?.harvesterHeadCount ?? 'Harvesters'}
                    </Label>
                    <Input
                      id="harvesterHeadCount"
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      placeholder={h?.harvesterHeadCountPlaceholder ?? 'e.g. 4'}
                      value={harvesterHeadCount}
                      onChange={(e) => setHarvesterHeadCount(e.target.value)}
                      aria-invalid={Boolean(timingErrors.harvesterHeadCount)}
                    />
                    <FieldMessage size="xs">
                      {timingErrors.harvesterHeadCount}
                    </FieldMessage>
                  </div>
                </div>

                {/* Per-harvest yield input mode. Creating: flips the entry
                    layout directly. Editing: stages a server-side conversion
                    of this harvest's stored entries, confirmed inline below
                    (with a crate picker when switching to crate mode). */}
                <div className="bg-card space-y-3 rounded-xl border p-3 shadow-sm">
                  <HarvestInputModeField
                    value={currentData.inputMode}
                    pendingValue={pendingMode}
                    onSelect={handleModeSelect}
                    disabled={busy}
                  />
                  {pendingMode !== null && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {h?.convertModeDescription ??
                            "This converts this harvest's entries to the new input mode. You can switch back at any time."}
                        </span>
                      </div>
                      {pendingMode === InputMode.Crate && (
                        <CrateSelectField
                          value={pendingCrate?.id ?? null}
                          onSelect={handlePendingCrateSelect}
                          error={
                            pendingCrateMissing
                              ? (h?.selectCrateToConvert ??
                                'Select a crate to convert')
                              : undefined
                          }
                          disabled={busy}
                        />
                      )}
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelModeSwitch}
                          disabled={busy}
                          className="w-full sm:w-auto"
                        >
                          {h?.cancel ?? 'Cancel'}
                        </Button>
                        <WriteActionButton
                          type="button"
                          onClick={handleConfirmModeSwitch}
                          disabled={busy || pendingCrateMissing}
                          className="w-full sm:w-auto"
                        >
                          {converting
                            ? (h?.updating ?? 'Updating...')
                            : (h?.convertModeConfirm ?? 'Convert')}
                        </WriteActionButton>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crate selector: crate-mode only, between the harvesters
                    fields above and the entries it drives below. Required —
                    crate-mode kg derive from the chosen crate's weight. */}
                {isCrateMode && (
                  <div className="bg-card rounded-xl border p-3 shadow-sm">
                    <CrateSelectField
                      value={currentData.crateId}
                      onSelect={handleCrateSelect}
                      error={crateError}
                      disabled={busy}
                    />
                  </div>
                )}

                {currentData.entries.map((entry, index) => (
                  <HarvestEntryCard
                    key={index}
                    entry={entry}
                    index={index}
                    inputMode={currentData.inputMode}
                    crateWeight={currentData.crateWeight}
                    isTomato={isTomatoSpecies(currentData.species)}
                    batchStartRow={currentData.startRow}
                    batchEndRow={currentData.endRow}
                    wasteConfirmed={confirmedWasteEntries.has(index)}
                    onConfirmWasteChange={(confirmed) =>
                      setWasteConfirmed(index, confirmed)
                    }
                    defaultOpen={index === 0 || entryHasData(entry)}
                    onChange={(change) => handleEntryChange(index, change)}
                    onBrixChange={(readingIndex, value) =>
                      handleBrixChange(index, readingIndex, value)
                    }
                    onBrixClassChange={(readingIndex, value) =>
                      handleBrixClassChange(index, readingIndex, value)
                    }
                    onAddBrixReading={() => handleAddBrixReading(index)}
                    onRemoveBrixReading={(readingIndex) =>
                      handleRemoveBrixReading(index, readingIndex)
                    }
                    onSetShowBrix={(show) => handleSetShowBrix(index, show)}
                    onSampleWeightChange={(value) =>
                      handleSampleWeightChange(index, value)
                    }
                    onSampleFruitCountChange={(value) =>
                      handleSampleFruitCountChange(index, value)
                    }
                    onSetShowFruitWeight={(show) =>
                      handleSetShowFruitWeight(index, show)
                    }
                    isLoading={busy}
                  />
                ))}

                <div className="bg-card rounded-xl border p-3 shadow-sm">
                  <PhotosField
                    photos={currentData.photos}
                    onUpload={handlePhotoUpload}
                    onRemove={handleRemovePhoto}
                    isLoading={busy}
                  />
                </div>
                <div className="h-16" />
              </fieldset>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                {h?.noBatchSelected ?? 'No batch selected'}
              </p>
            </div>
          )}
        </div>

        {!readOnly && (
          <SheetFooter className="bg-background/95 dark:border-primary-foreground/30 border-t px-4 py-4 backdrop-blur-sm sm:px-6">
            <WriteActionButton
              onClick={handleSave}
              disabled={busy || !canSave}
              className="h-12 w-full text-base font-semibold shadow-sm sm:text-lg"
              size="lg"
            >
              {buttonLabel}
            </WriteActionButton>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
