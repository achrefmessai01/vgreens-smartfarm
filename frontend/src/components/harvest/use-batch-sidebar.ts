'use client'

import * as React from 'react'
import {
  HarvestStatus,
  useUpdateHarvestMutation,
} from '@/generated/graphql'
import type { BatchDetailsData } from './batch-sidebar-types'

function computeAvgBrix(brix: BatchDetailsData['brixMeasurements']): number {
  const values = [
    brix.brix1, brix.brix2, brix.brix3, brix.brix4, brix.brix5,
    brix.brix6, brix.brix7, brix.brix8, brix.brix9, brix.brix10,
  ].filter((v) => v > 0)
  if (values.length === 0) return 0
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}

interface UseBatchSidebarOptions {
  harvestId: string | null
  batchData: BatchDetailsData | null
  onCompleted?: () => void
}

export function useBatchSidebar({
  harvestId,
  batchData,
  onCompleted,
}: UseBatchSidebarOptions) {
  const [localData, setLocalData] = React.useState<BatchDetailsData | null>(null)
  const [updateHarvest, { loading }] = useUpdateHarvestMutation()

  React.useEffect(() => {
    setLocalData(batchData)
  }, [batchData])

  const currentData = localData ?? batchData

  const handleBrixChange = React.useCallback(
    (field: keyof BatchDetailsData['brixMeasurements'], value: number) => {
      setLocalData((prev) =>
        prev ? { ...prev, brixMeasurements: { ...prev.brixMeasurements, [field]: value } } : prev,
      )
    },
    [],
  )

  const handleYieldChange = React.useCallback(
    (field: 'marketable' | 'waste', value: number) => {
      setLocalData((prev) =>
        prev ? { ...prev, todaysHarvest: { ...prev.todaysHarvest, [field]: value } } : prev,
      )
    },
    [],
  )

  const handleLogHarvest = React.useCallback(async () => {
    if (!harvestId || !currentData) return
    const brix = currentData.brixMeasurements
    try {
      await updateHarvest({
        variables: {
          id: harvestId,
          input: {
            classA: currentData.todaysHarvest.marketable,
            waste: currentData.todaysHarvest.waste,
            avgBrix: computeAvgBrix(brix),
            ...brix,
            photos: currentData.photos.length,
            photoUrls: currentData.photos,
            date: new Date().toISOString(),
            status: HarvestStatus.Completed,
          },
        },
      })
      onCompleted?.()
    } catch (err) {
      console.error('Failed to log harvest:', err)
    }
  }, [harvestId, currentData, updateHarvest, onCompleted])

  const canEdit = currentData?.status === HarvestStatus.Draft || currentData?.status === HarvestStatus.Active
  const canComplete = canEdit

  return {
    currentData,
    loading,
    canEdit,
    canComplete,
    handleBrixChange,
    handleYieldChange,
    handleLogHarvest,
  }
}
