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
import { greenhouseOptions } from './create-batch-data'

interface FormFieldProps {
  formData: BatchFormData
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>
  errors: BatchFormErrors
}

export function GreenhouseField({ formData, setFormData, errors }: FormFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  return (
    <div className="space-y-2">
      <Label htmlFor="sourceGreenhouse" className="text-sm font-medium">
        {h?.greenhouse ?? 'Greenhouse'} <span className="text-destructive">*</span>
      </Label>
      <Select
        value={formData.sourceGreenhouseId}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, sourceGreenhouseId: value }))
        }
      >
        <SelectTrigger className={`w-full h-10 ${errors.sourceGreenhouseId ? 'border-destructive' : ''}`}>
          <SelectValue placeholder={h?.selectGreenhouse ?? 'Select greenhouse...'} />
        </SelectTrigger>
        <SelectContent>
          {greenhouseOptions.map((greenhouse) => (
            <SelectItem key={greenhouse.value} value={greenhouse.value}>
              {greenhouse.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.sourceGreenhouseId && (
        <p className="text-sm text-destructive">{errors.sourceGreenhouseId}</p>
      )}
    </div>
  )
}

export function SpeciesField({ formData, setFormData, errors }: FormFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest

  return (
    <div className="space-y-2">
      <Label htmlFor="species" className="text-sm font-medium">
        {h?.species ?? 'Species'} <span className="text-destructive">*</span>
      </Label>
      <Input
        id="species"
        type="text"
        placeholder={h?.enterSpecies ?? 'Enter species...'}
        value={formData.species}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, species: e.target.value }))
        }
        className={`h-10 ${errors.species ? 'border-destructive' : ''}`}
      />
      {errors.species && (
        <p className="text-sm text-destructive">{errors.species}</p>
      )}
    </div>
  )
}
