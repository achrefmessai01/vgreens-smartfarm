'use client'

import { useI18n } from '@/i18n'
import type { BatchDetailsData } from './batch-sidebar-types'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { BatchHeaderField, BatchStatsField } from './batch-sidebar-basic-fields'
import { BrixMeasurementsField } from './batch-sidebar-brix-field'
import { PhotosField } from './batch-sidebar-photos-field'
import { YieldDataField } from './batch-sidebar-yield-field'
import { useBatchSidebar, type SidebarMode } from './use-batch-sidebar'

export interface BatchSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  harvestId: string | null
  batchData: BatchDetailsData | null
  mode?: SidebarMode
  onCompleted?: () => void
  onPhotoUpload?: (files: File[]) => void
  isLoading?: boolean
}

export function BatchSidebar({
  open,
  onOpenChange,
  harvestId,
  batchData,
  mode = 'create',
  onCompleted,
  onPhotoUpload,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n()
  const h = t.pages.harvest
  const {
    currentData,
    loading: isSaving,
    handleBrixChange,
    handleYieldChange,
    handleSave,
  } = useBatchSidebar({ harvestId, batchData, mode, onCompleted })

  const busy = isLoading || isSaving

  const buttonLabel = isSaving
    ? (mode === 'edit' ? (h?.updating ?? 'Updating...') : (h?.saving ?? 'Saving...'))
    : (mode === 'edit' ? (h?.update ?? 'Update') : (h?.logHarvest ?? 'Log Harvest'))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
          <SheetTitle className="dark:text-card-foreground">
            {currentData?.greenhouse?.name
              ? `${h?.batchDetails ?? 'Batch Details'} for ${currentData.greenhouse.name}`
              : h?.batchDetails ?? 'Batch Details'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {currentData ? (
            <>
              <div className="shrink-0 px-6 py-4 border-b dark:border-primary-foreground/30 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 space-y-6">
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

              <div className="flex-1 min-h-0 overflow-y-scroll px-6 py-6 space-y-6">
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
                  onUpload={onPhotoUpload}
                  isLoading={busy}
                />
                <div className="h-16" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {h?.noBatchSelected ?? 'No batch selected'}
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t dark:border-primary-foreground/30">
          <Button
            onClick={handleSave}
            disabled={busy || !harvestId}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {buttonLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
