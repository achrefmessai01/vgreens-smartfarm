'use client'

import * as React from 'react'
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
import { FieldGroup } from '@/components/ui/field'
import {
  BatchHeaderField,
  BatchStatsField,
  YieldDataField,
} from './batch-sidebar-fields'
import {
  BrixMeasurementsField,
  PhotosField,
} from './batch-sidebar-additional-fields'
import { useBatchSidebarState } from './batch-sidebar-state'

export interface BatchSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchData: BatchDetailsData | null
  onEdit?: (batch: BatchDetailsData) => void
  onComplete?: (batch: BatchDetailsData) => void
  onPhotoUpload?: (files: File[]) => void
  onBatchUpdate?: (batch: BatchDetailsData) => void
  isLoading?: boolean
}

export function BatchSidebar({
  open,
  onOpenChange,
  batchData,
  onEdit,
  onComplete,
  onPhotoUpload,
  onBatchUpdate,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n()
  
  const {
    currentData,
    canEdit,
    canComplete,
    handleBrixMeasurementChange,
    handleYieldChange,
  } = useBatchSidebarState(batchData, onBatchUpdate)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
          <SheetTitle className="dark:text-card-foreground">
            {currentData?.greenhouse?.name 
              ? `${t.pages.harvest?.batchDetails || 'Batch Details'} for ${currentData.greenhouse.name}`
              : (t.pages.harvest?.batchDetails || 'Batch Details')
            }
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {currentData ? (
            <>
              {/* Fixed Upper Section - Batch Info through Area */}
              <div className="shrink-0 px-6 py-4 border-b dark:border-primary-foreground/30 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 space-y-6">
                <BatchHeaderField
                  name={currentData.name}
                  species={currentData.species}
                  variety={currentData.variety}
                  status={currentData.status}
                  isLoading={isLoading}
                />

                <BatchStatsField
                  daysAfterPlanting={currentData.daysAfterPlanting}
                  area={currentData.area}
                  isLoading={isLoading}
                />
              </div>

              {/* Scrollable Lower Section - Data Entry */}
              <div className="flex-1 min-h-0 overflow-y-scroll px-6 py-6 space-y-6">
                <YieldDataField
                  marketable={currentData.todaysHarvest.marketable}
                  waste={currentData.todaysHarvest.waste}
                  onYieldChange={handleYieldChange}
                  isLoading={isLoading}
                />

                <BrixMeasurementsField
                  measurements={currentData.brixMeasurements}
                  onMeasurementChange={handleBrixMeasurementChange}
                  isLoading={isLoading}
                />

                <PhotosField
                  photos={currentData.photos}
                  onUpload={onPhotoUpload}
                  isLoading={isLoading}
                />
                
                {/* Extra spacing to ensure all content is accessible above the button */}
                <div className="h-16"></div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {t.pages.harvest?.noBatchSelected || 'No batch selected'}
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t dark:border-primary-foreground/30">
          <Button
            onClick={() => onComplete?.(batchData!)}
            disabled={isLoading || !batchData}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            Log Harvest
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
