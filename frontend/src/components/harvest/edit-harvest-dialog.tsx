'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CreateBatchFormFields } from './create-batch-form-fields'
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types'

interface EditHarvestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: BatchFormData
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>
  errors: BatchFormErrors
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
}

export function EditHarvestDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  errors,
  loading,
  onSubmit,
  onReset,
}: EditHarvestDialogProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onReset()
      onOpenChange(nextOpen)
    },
    [onReset, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {h?.editHarvest ?? 'Edit Harvest'}
          </DialogTitle>
          <DialogDescription>
            {h?.editHarvestDescription ?? 'Update the harvest record details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <CreateBatchFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {h?.cancel ?? 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? (h?.updating ?? 'Updating...')
                : (h?.update ?? 'Update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
