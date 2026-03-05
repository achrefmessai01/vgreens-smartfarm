'use client'

import * as React from 'react'
import type { BatchDetailsData } from './batch-sidebar-types'

export function useBatchSidebarState(
  batchData: BatchDetailsData | null,
  onUpdate?: (batch: BatchDetailsData) => void
) {
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
      const updatedBatch = {
        ...localBatchData,
        todaysHarvest: {
          ...localBatchData.todaysHarvest,
          [field]: value,
        },
      }
      setLocalBatchData(updatedBatch)
      onUpdate?.(updatedBatch)
    }
  }

  const currentData = localBatchData || batchData
  const canEdit = currentData?.status === 'active'
  const canComplete = currentData?.status === 'active'

  return {
    currentData,
    canEdit,
    canComplete,
    handleBrixMeasurementChange,
    handleYieldChange,
  }
}