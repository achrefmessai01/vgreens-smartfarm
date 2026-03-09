'use client'

import * as React from 'react'
import { Upload } from 'lucide-react'
import { useI18n } from '@/i18n'
import type { PhotosFieldProps } from './batch-sidebar-types'

export function PhotosField({
  photos = [],
  onUpload,
  isLoading = false,
}: PhotosFieldProps) {
  const { t } = useI18n()
  const h = t.pages.harvest
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
      <h3 className="font-medium">{h?.photos ?? 'Photos'}</h3>
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        onClick={handleUploadClick}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {h?.uploadPhotos ?? 'Click to upload or drag and drop'}
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
                alt={`${h?.photoAlt ?? 'Photo'} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
