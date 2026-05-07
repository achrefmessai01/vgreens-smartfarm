'use client';

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
import { Sparkles } from 'lucide-react';
import { PhotosField } from './fields/batch-sidebar-photos-field';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { YieldDataField } from './fields/batch-sidebar-yield-field';
import { BrixMeasurementsField } from './fields/batch-sidebar-brix-field';

export interface BatchSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  onCompleted?: () => void;
  isLoading?: boolean;
}

export function BatchSidebar({
  open,
  onOpenChange,
  harvestId,
  batchData,
  mode = 'create',
  onCompleted,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const {
    currentData,
    loading: isSaving,
    showBrix,
    setShowBrix,
    handleBrixChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  } = useBatchSidebar({ harvestId, batchData, mode, onCompleted });

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
              ? `${h?.batchDetails ?? 'Batch Details'} for ${currentData.greenhouse.name}`
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
                <div className="bg-card rounded-xl border p-3 shadow-sm">
                  <YieldDataField
                    marketable={currentData.todaysHarvest.marketable}
                    waste={currentData.todaysHarvest.waste}
                    classB={currentData.todaysHarvest.classB}
                    rowX={currentData.todaysHarvest.rowX}
                    rowY={currentData.todaysHarvest.rowY}
                    onYieldChange={handleYieldChange}
                    isLoading={busy}
                  />
                </div>
                <div className="bg-card rounded-xl border p-3 shadow-sm">
                  <BrixMeasurementsField
                    readings={currentData.brixReadings}
                    showBrix={showBrix}
                    onShowBrixChange={setShowBrix}
                    onReadingChange={handleBrixChange}
                    onAddReading={handleAddBrixReading}
                    onRemoveReading={handleRemoveBrixReading}
                    isLoading={busy}
                  />
                </div>
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
