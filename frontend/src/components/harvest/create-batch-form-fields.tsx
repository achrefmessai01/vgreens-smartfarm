'use client'

import * as React from 'react'
import type { BatchFormData, BatchFormErrors } from '@/lib/types/batch'
import { GreenhouseField, SpeciesField } from './create-batch-form-field-components'
import { VarietyField, PlantingDateField, CultivationAreaField } from './create-batch-more-field-components'

interface CreateBatchFormFieldsProps {
  formData: BatchFormData
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>
  errors: BatchFormErrors
}

export function CreateBatchFormFields({
  formData,
  setFormData,
  errors,
}: CreateBatchFormFieldsProps) {
  return (
    <div className="space-y-4">
      <GreenhouseField formData={formData} setFormData={setFormData} errors={errors} />
      <SpeciesField formData={formData} setFormData={setFormData} errors={errors} />
      <VarietyField formData={formData} setFormData={setFormData} errors={errors} />
      <PlantingDateField formData={formData} setFormData={setFormData} errors={errors} />
      <CultivationAreaField formData={formData} setFormData={setFormData} errors={errors} />
    </div>
  )
}