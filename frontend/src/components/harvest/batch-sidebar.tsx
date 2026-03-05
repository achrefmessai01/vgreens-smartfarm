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

export interface BatchSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batchData: BatchDetailsData | null
  onEdit?: (batch: BatchDetailsData) => void
  onComplete?: (batch: BatchDetailsData) => void
  onPhotoUpload?: (files: File[]) => void
  isLoading?: boolean
}

export function BatchSidebar({
  open,
  onOpenChange,
  batchData,
  onEdit,
  onComplete,
  onPhotoUpload,
  isLoading = false,
}: BatchSidebarProps) {
  const { t } = useI18n()
  
  // Local state to manage editable batch data
  const [localBatchData, setLocalBatchData] = React.useState<BatchDetailsData | null>(null)

  // Update local state when batchData changes
  React.useEffect(() => {
    setLocalBatchData(batchData)
  }, [batchData])

  const handleBrixMeasurementChange = (field: keyof BatchDetailsData['brixMeasurements'], value: number) => {
    if (localBatchData) {
      setLocalBatchData({
        ...localBatchData,
        brixMeasurements: {
          ...localBatchData.brixMeasurements,
          [field]: value,
        },
      })
    }
  }

  const handleYieldChange = (field: 'marketable' | 'waste', value: number) => {
    if (localBatchData) {
      setLocalBatchData({
        ...localBatchData,
        todaysHarvest: {
          ...localBatchData.todaysHarvest,
          [field]: value,
        },
      })
    }
  }

  const currentData = localBatchData || batchData
  const canEdit = currentData?.status === 'active'
  const canComplete = currentData?.status === 'active'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
          <SheetTitle className="dark:text-card-foreground">
            {currentData?.greenhouse?.name 
              ? `${t.pages.harvest?.batchDetails || 'Batch Details'} for ${currentData.greenhouse.name}`
              : (t.pages.harvest?.batchDetails || 'Batch Details')
            }
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {currentData ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t.pages.harvest?.noBatchSelected || 'No batch selected'}
            </p>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
          >
            {t.pages.harvest?.close || 'Close'}
          </Button>

          {canEdit && batchData && onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(batchData)}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.harvest?.editBatch || 'Edit'}
            </Button>
          )}

          {canComplete && batchData && onComplete && (
            <Button
              onClick={() => onComplete(batchData)}
              disabled={isLoading}
              className="flex-1"
            >
              {t.pages.harvest?.completeBatch || 'Complete Batch'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}