'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/i18n'
import type { BatchFormData, BatchFormErrors } from '@/lib/types/batch'
import { CreateBatchFormFields } from './create-batch-form-fields'

interface CreateBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BatchFormData) => void
  isLoading?: boolean
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateBatchDialogProps) {
  const { t } = useI18n()
  const [formData, setFormData] = React.useState<BatchFormData>({
    species: '',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    cultivationArea: 0,
    sourceGreenhouseId: '',
  })

  const [errors, setErrors] = React.useState<BatchFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: BatchFormErrors = {}

    if (!formData.species) {
      newErrors.species = 'Species is required'
    }

    if (!formData.variety) {
      newErrors.variety = 'Variety is required'
    }

    if (!formData.plantingDate) {
      newErrors.plantingDate = 'Planting date is required'
    }

    if (!formData.cultivationArea || formData.cultivationArea <= 0) {
      newErrors.cultivationArea = 'Valid cultivation area is required'
    }

    if (!formData.sourceGreenhouseId) {
      newErrors.sourceGreenhouseId = 'Greenhouse selection is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
      // Reset form
      setFormData({
        species: '',
        variety: '',
        plantingDate: new Date().toISOString().split('T')[0],
        cultivationArea: 0,
        sourceGreenhouseId: '',
      })
      setErrors({})
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setFormData({
        species: '',
        variety: '',
        plantingDate: new Date().toISOString().split('T')[0],
        cultivationArea: 0,
        sourceGreenhouseId: '',
      })
      setErrors({})
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.pages.harvest?.createNewBatch || 'Create New Batch'}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t.pages.harvest?.setUpNewBatch || 'Set up a new cultivation batch for GH1'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CreateBatchFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t.pages.harvest?.cancel || 'Cancel'}
            </Button>
            <Button
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (t.pages.harvest?.creating || 'Creating...') : (t.pages.harvest?.createBatch || 'Create Batch')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}