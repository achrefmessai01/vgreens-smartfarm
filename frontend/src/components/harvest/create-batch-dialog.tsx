'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  const getVarietiesForSpecies = (species: string) => {
    const varietyMap: Record<string, Array<{ value: string; label: string }>> = {
      strawberry: [
        { value: 'Elsanta', label: 'Elsanta' },
        { value: 'Sonata', label: 'Sonata' },
        { value: 'Albion', label: 'Albion' },
      ],
      tomato: [
        { value: 'Cherry', label: 'Cherry' },
        { value: 'Beefsteak', label: 'Beefsteak' },
        { value: 'Roma', label: 'Roma' },
      ],
      lettuce: [
        { value: 'Iceberg', label: 'Iceberg' },
        { value: 'Romaine', label: 'Romaine' },
        { value: 'Butterhead', label: 'Butterhead' },
      ],
      basil: [
        { value: 'Genovese', label: 'Genovese' },
        { value: 'Thai', label: 'Thai Basil' },
        { value: 'Purple', label: 'Purple Basil' },
      ],
      pepper: [
        { value: 'California', label: 'California Wonder' },
        { value: 'Bell', label: 'Bell Pepper' },
        { value: 'Jalapeno', label: 'Jalapeño' },
      ],
    }

    return varietyMap[species] || []
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
          {/* Source Greenhouse */}
          <div className="space-y-2">
            <Label htmlFor="sourceGreenhouse" className="text-sm font-medium">
             Greenhouse <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sourceGreenhouseId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, sourceGreenhouseId: value }))
              }
            >
              <SelectTrigger className={`w-full h-10 ${errors.sourceGreenhouseId ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select greenhouse..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gh1">GH1</SelectItem>
                <SelectItem value="gh2">GH2</SelectItem>
              </SelectContent>
            </Select>
            {errors.sourceGreenhouseId && (
              <p className="text-sm text-destructive">{errors.sourceGreenhouseId}</p>
            )}
          </div>

          {/* Species */}
          <div className="space-y-2">
            <Label htmlFor="species" className="text-sm font-medium">
              {t.pages.harvest?.species || 'Species'} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.species}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, species: value, variety: '' }))
              }}
            >
              <SelectTrigger className={`w-full h-10 ${errors.species ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select species..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strawberry">Strawberry</SelectItem>
                <SelectItem value="tomato">Tomato</SelectItem>
                <SelectItem value="lettuce">Lettuce</SelectItem>
                <SelectItem value="basil">Basil</SelectItem>
                <SelectItem value="pepper">Pepper</SelectItem>
              </SelectContent>
            </Select>
            {errors.species && (
              <p className="text-sm text-destructive">{errors.species}</p>
            )}
          </div>

          {/* Variety */}
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

          {/* Planting Date */}
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

          {/* Cultivation Area */}
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