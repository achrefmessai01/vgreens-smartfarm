'use client'

import * as React from 'react'
import { Upload } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@/components/ui/field'
import type {
  BrixMeasurementsFieldProps,
  PhotosFieldProps
} from './batch-sidebar-types'

export function BrixMeasurementsField({
  measurements,
  onMeasurementChange,
  isLoading = false
}: BrixMeasurementsFieldProps) {
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const brixEntries = [
    { label: 'Brix 1', field: 'brix1' as const, value: measurements.brix1 },
    { label: 'Brix 2', field: 'brix2' as const, value: measurements.brix2 },
    { label: 'Brix 3', field: 'brix3' as const, value: measurements.brix3 },
    { label: 'Brix 4', field: 'brix4' as const, value: measurements.brix4 },
    { label: 'Brix 5', field: 'brix5' as const, value: measurements.brix5 },
    { label: 'Brix 6', field: 'brix6' as const, value: measurements.brix6 },
    { label: 'Brix 7', field: 'brix7' as const, value: measurements.brix7 },
    { label: 'Brix 8', field: 'brix8' as const, value: measurements.brix8 },
    { label: 'Brix 9', field: 'brix9' as const, value: measurements.brix9 },
    { label: 'Brix 10', field: 'brix10' as const, value: measurements.brix10 },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-medium text-center">QUALITY METRICS</p>
      <div className="space-y-3">
        <p className="text-sm font-medium">BRIX MEASUREMENTS</p>
        <div className="grid grid-cols-5 gap-3">
          {brixEntries.map((entry, index) => (
            <div key={index} className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">{entry.label}</p>
              <Input
                type="number"
                min="0"
                max="30"
                step="1"
                value={Math.round(entry.value)}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 0
                  onMeasurementChange?.(entry.field, newValue)
                }}
                className="text-center h-10"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PhotosField({
  photos = [],
  onUpload,
  isLoading = false
}: PhotosFieldProps) {
  const { t } = useI18n()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && onUpload) {
      onUpload(Array.from(files))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Photos</h3>
      <div 
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        onClick={handleUploadClick}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Click to upload or drag and drop
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}