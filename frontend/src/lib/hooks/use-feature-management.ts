'use client'

import {
  type Feature,
  useFeaturesQuery,
  useCreateFeatureMutation,
  useDeleteFeatureMutation,
  useUpdateFeatureMutation,
} from '@/generated/graphql'
import * as React from 'react'
import type { FeatureFormData } from '@/components/features/feature-form'

export function useFeatureManagement() {
  const { data, loading, refetch } = useFeaturesQuery()
  const [createFeature] = useCreateFeatureMutation()
  const [updateFeature] = useUpdateFeatureMutation()
  const [deleteFeature] = useDeleteFeatureMutation()

  const [isLoading, setIsLoading] = React.useState(false)
  const [editingFeature, setEditingFeature] = React.useState<Feature | null>(
    null
  )
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    feature: Feature | null
    isOpen: boolean
  }>({ feature: null, isOpen: false })

  const features = (data?.features || []) as Feature[]

  const handleCreate = () => {
    setEditingFeature(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature)
    setIsSheetOpen(true)
  }

  const handleDelete = (feature: Feature) => {
    setDeleteConfirmation({ feature, isOpen: true })
  }

  const handleSubmit = async (formData: FeatureFormData) => {
    setIsLoading(true)
    try {
      if (editingFeature) {
        await updateFeature({
          variables: {
            id: editingFeature.id,
            input: {
              id: editingFeature.id,
              ...formData,
            },
          },
        })
      } else {
        await createFeature({
          variables: {
            input: formData,
          },
        })
      }
      await refetch()
      setIsSheetOpen(false)
      setEditingFeature(null)
    } catch (error) {
      console.error('Error saving feature:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.feature) return

    setIsLoading(true)
    try {
      await deleteFeature({
        variables: { id: deleteConfirmation.feature.id },
      })
      await refetch()
      setDeleteConfirmation({ feature: null, isOpen: false })
    } catch (error) {
      console.error('Error deleting feature:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      setEditingFeature(null)
    }
  }

  const handleDeleteDialogClose = (open: boolean) => {
    setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
  }

  return {
    features,
    loading,
    isLoading,
    editingFeature,
    isSheetOpen,
    deleteConfirmation,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleDeleteConfirm,
    handleSheetClose,
    handleDeleteDialogClose,
  }
}
