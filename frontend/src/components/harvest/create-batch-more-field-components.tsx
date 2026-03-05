'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n'
import type { BatchFormData, BatchFormErrors } from '@/lib/types/batch'
import { getVarietiesForSpecies } from './create-batch-data'

interface FormFieldProps {
  formData: BatchFormData
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>
  errors: BatchFormErrors
}

export function VarietyField({ formData, setFormData, errors }: FormFieldProps) {
  const { t } = useI18n()
  
  return (
    <div className="space-y-2">
      <Label htmlFor="variety" className="text-sm font-medium">
        {t.pages.harvest?.variety || 'Variety'} <span className="text-destructive">*</span>
      </Label>
      <Select
        value={formData.variety}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, variety: value }))
        }
        disabled={!formData.species}
      >
        <SelectTrigger className={`w-full h-10 ${errors.variety ? 'border-destructive' : ''}`}>
          <SelectValue placeholder="Select variety..." />
        </SelectTrigger>
        <SelectContent>
          {getVarietiesForSpecies(formData.species).map((variety) => (
            <SelectItem key={variety.value} value={variety.value}>
              {variety.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.variety && (
        <p className="text-sm text-destructive">{errors.variety}</p>
      )}
    </div>
  )
}

export function PlantingDateField({ formData, setFormData, errors }: FormFieldProps) {
  const { t } = useI18n()
  
  return (
    <div className="space-y-2">
      <Label htmlFor="plantingDate" className="text-sm font-medium">
        {t.pages.harvest?.plantingDate || 'Planting Date'} <span className="text-destructive">*</span>
      </Label>
      <Input
        id="plantingDate"
        type="date"
        value={formData.plantingDate}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, plantingDate: e.target.value }))
        }
        className={`h-10 ${errors.plantingDate ? 'border-destructive' : ''}`}
      />
      {errors.plantingDate && (
        <p className="text-sm text-destructive">{errors.plantingDate}</p>
      )}
    </div>
  )
}

export function CultivationAreaField({ formData, setFormData, errors }: FormFieldProps) {
  const { t } = useI18n()
  
  return (
    <div className="space-y-2">
      <Label htmlFor="cultivationArea" className="text-sm font-medium">
        {t.pages.harvest?.cultivationArea || 'Cultivation Area (m²)'} <span className="text-destructive">*</span>
      </Label>
      <Input
        id="cultivationArea"
        type="number"
        min="0"
        step="0.1"
        placeholder="Enter area in square meters"
        value={formData.cultivationArea || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            cultivationArea: parseFloat(e.target.value) || 0,
          }))
        }
        className={`h-10 ${errors.cultivationArea ? 'border-destructive' : ''}`}
      />
      {errors.cultivationArea && (
        <p className="text-sm text-destructive">{errors.cultivationArea}</p>
      )}
    </div>
  )
}