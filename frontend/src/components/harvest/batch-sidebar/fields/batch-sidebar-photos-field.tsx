'use client';

import * as React from 'react';
import Image from 'next/image';
import { useI18n } from '@/i18n';
import { Upload, X } from 'lucide-react';
import type { PhotosFieldProps } from '@/types/batch-sidebar.types';

export function PhotosField({
  photos = [],
  onUpload,
  onRemove,
  isLoading = false,
}: PhotosFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onUpload) {
      onUpload(Array.from(files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && onUpload) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/'),
      );
      if (imageFiles.length > 0) {
        onUpload(imageFiles);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-5 animate-pulse rounded" />
        <div className="bg-muted h-32 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{h?.photos ?? 'Photos'}</h3>
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload
          className={`mx-auto mb-2 h-8 w-8 transition-colors ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <p
          className={`text-sm transition-colors ${
            isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
          }`}
        >
          {isDragOver
            ? 'Drop images here'
            : (h?.uploadPhotos ?? 'Click to upload or drag and drop')}
        </p>
        {isDragOver && (
          <p className="text-primary mt-1 text-xs">Release to upload</p>
        )}
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
            <div
              key={index}
              className="bg-muted group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={photo}
                alt={`${h?.photoAlt ?? 'Photo'} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 100px"
                unoptimized
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
