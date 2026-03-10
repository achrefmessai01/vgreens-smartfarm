'use client'

import * as React from 'react'
import {
  HarvestStatus,
  useUpdateHarvestMutation,
} from '@/generated/graphql'
import type { BatchDetailsData } from './batch-sidebar-types'

export type SidebarMode = 'create' | 'edit'

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
  mode?: SidebarMode
  onCompleted?: () => void
}

export function useBatchSidebar({
  harvestId,
  batchData,
  mode = 'create',
  onCompleted,
}: UseBatchSidebarOptions) {
  const [localData, setLocalData] = React.useState<BatchDetailsData | null>(null)
  const [updateHarvest, { loading }] = useUpdateHarvestMutation()

  React.useEffect(() => {
    setLocalData(batchData)
  }, [batchData])

  // Cleanup object URLs on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (localData?.photos) {
        localData.photos.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url)
          }
        })
      }
    }
  }, [])

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

  const handlePhotoUpload = React.useCallback((files: File[]) => {
    // Convert files to object URLs for display
    const photoUrls = files.map(file => URL.createObjectURL(file))
    
    setLocalData((prev) =>
      prev ? { ...prev, photos: [...prev.photos, ...photoUrls] } : prev,
    )
  }, [])

  const handleRemovePhoto = React.useCallback((indexToRemove: number) => {
    setLocalData((prev) => {
      if (!prev) return prev
      
      // Revoke the object URL to free memory
      const urlToRevoke = prev.photos[indexToRemove]
      if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRevoke)
      }
      
      return {
        ...prev,
        photos: prev.photos.filter((_, index) => index !== indexToRemove)
      }
    })
  }, [])

  const handleSave = React.useCallback(async () => {
    if (!harvestId || !currentData) return
    const brix = currentData.brixMeasurements
    const status = mode === 'edit' ? currentData.status : HarvestStatus.Completed
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
            date: mode === 'edit' ? undefined : new Date().toISOString(),
            status,
          },
        },
      })
      onCompleted?.()
    } catch (err) {
      console.error('Failed to save harvest:', err)
    }
  }, [harvestId, currentData, mode, updateHarvest, onCompleted])

  return {
    currentData,
    loading,
    mode,
    handleBrixChange,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  }
}
