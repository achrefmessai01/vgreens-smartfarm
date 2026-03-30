'use client';

import { useI18n } from '@/i18n';
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
    handleBrixChange,
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
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
      >
        <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
          <SheetTitle className="dark:text-card-foreground">
            {currentData?.greenhouse?.name
              ? `${h?.batchDetails ?? 'Batch Details'} for ${currentData.greenhouse.name}`
              : (h?.batchDetails ?? 'Batch Details')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {currentData ? (
            <>
              <div className="dark:border-primary-foreground/30 from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 shrink-0 space-y-6 border-b bg-gradient-to-r px-6 py-4">
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

              <div className="min-h-0 flex-1 space-y-6 overflow-y-scroll px-6 py-6">
                <YieldDataField
                  marketable={currentData.todaysHarvest.marketable}
                  waste={currentData.todaysHarvest.waste}
                  onYieldChange={handleYieldChange}
                  isLoading={busy}
                />
                <BrixMeasurementsField
                  measurements={currentData.brixMeasurements}
                  onMeasurementChange={handleBrixChange}
                  isLoading={busy}
                />
                <PhotosField
                  photos={currentData.photos}
                  onUpload={handlePhotoUpload}
                  onRemove={handleRemovePhoto}
                  isLoading={busy}
                />
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

        <SheetFooter className="dark:border-primary-foreground/30 border-t px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={busy || !harvestId}
            className="h-12 w-full text-lg font-semibold"
            size="lg"
          >
            {buttonLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
