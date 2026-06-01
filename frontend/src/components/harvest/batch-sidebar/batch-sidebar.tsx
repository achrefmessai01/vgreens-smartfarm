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
import {
  BatchStatsField,
  BatchHeaderField,
} from './fields/batch-sidebar-basic-fields';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Sparkles } from 'lucide-react';
import { PhotosField } from './fields/batch-sidebar-photos-field';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { HarvestEntryCard } from './fields/harvest-entry-card';

export interface BatchSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  initialDate?: string | null;
  onCompleted?: () => void;
  isLoading?: boolean;
}

export function BatchSidebar({
  open,
  onOpenChange,
  harvestId,
  batchData,
  mode = 'create',
  initialDate,
  onCompleted,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const {
    currentData,
    loading: isSaving,
    harvestDate,
    setHarvestDate,
    handleBrixChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleFruitCountChange,
    handleYieldChange,
    handleSetShowBrix,
    handleSetShowFruitWeight,
    handleAddEntry,
    handleRemoveEntry,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  } = useBatchSidebar({ harvestId, batchData, mode, initialDate, onCompleted });
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

  const buttonLabel = isSaving
    ? mode === 'edit'
      ? (h?.updating ?? 'Updating...')
      : (h?.saving ?? 'Saving...')
    : mode === 'edit'
      ? (h?.update ?? 'Update')
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
              {mode === 'edit'
                ? (h?.editHarvest ?? 'Edit Harvest')
                : (h?.logHarvest ?? 'Log Harvest')}
            </Badge>
          </div>
          <SheetTitle className="dark:text-card-foreground pr-8 text-left leading-tight break-words">
            {currentData?.greenhouse?.name
              ? (h?.batchDetailsFor ?? '{label} for {greenhouse}')
                  .replace(
                    '{label}',
                    h?.batchDetails ?? 'Batch Details',
                  )
                  .replace('{greenhouse}', currentData.greenhouse.name)
              : (h?.batchDetails ?? 'Batch Details')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {currentData ? (
            <>
              <div className="dark:border-primary-foreground/30 shrink-0 space-y-6 border-b px-4 py-4 sm:px-6">
                <BatchHeaderField
                  name={currentData.name}
                  species={currentData.species}
                  variety={currentData.variety}
                  status={currentData.status}
                  isLoading={busy}
                />
                <BatchStatsField
                  daysAfterPlanting={currentData.daysAfterPlanting}
                  area={currentData.area}
                  isLoading={busy}
                />
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">
                    {h?.todaysHarvest ?? 'Today Harvest'}
                  </h3>
                  <button
                    type="button"
                    onClick={openDatePicker}
                    aria-label={h?.harvestDate ?? 'Harvest Date'}
                    className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70 focus-visible:ring-ring/40 focus-visible:ring-offset-background relative inline-flex h-7 w-fit cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
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

                {currentData.entries.map((entry, index) => (
                  <HarvestEntryCard
                    key={index}
                    entry={entry}
                    index={index}
                    canRemove={currentData.entries.length > 1}
                    defaultOpen={index === 0}
                    onYieldChange={(field, value) =>
                      handleYieldChange(index, field, value)
                    }
                    onBrixChange={(readingIndex, value) =>
                      handleBrixChange(index, readingIndex, value)
                    }
                    onAddBrixReading={() => handleAddBrixReading(index)}
                    onRemoveBrixReading={(readingIndex) =>
                      handleRemoveBrixReading(index, readingIndex)
                    }
                    onSetShowBrix={(show) => handleSetShowBrix(index, show)}
                    onFruitCountChange={(value) =>
                      handleFruitCountChange(index, value)
                    }
                    onSetShowFruitWeight={(show) =>
                      handleSetShowFruitWeight(index, show)
                    }
                    onRemove={() => handleRemoveEntry(index)}
                    isLoading={busy}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEntry}
                  disabled={busy}
                  className="w-full"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {h?.addEntry ?? 'Add entry'}
                </Button>

                <div className="bg-card rounded-xl border p-3 shadow-sm">
                  <PhotosField
                    photos={currentData.photos}
                    onUpload={handlePhotoUpload}
                    onRemove={handleRemovePhoto}
                    isLoading={busy}
                  />
                </div>
                <div className="h-16" />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                {h?.noBatchSelected ?? 'No batch selected'}
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="bg-background/95 dark:border-primary-foreground/30 border-t px-4 py-4 backdrop-blur-sm sm:px-6">
          <Button
            onClick={handleSave}
            disabled={busy || !harvestId}
            className="h-12 w-full text-base font-semibold shadow-sm sm:text-lg"
            size="lg"
          >
            {buttonLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
