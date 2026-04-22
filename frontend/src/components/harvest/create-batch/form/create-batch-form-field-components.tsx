'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

interface FormFieldProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

export function GreenhouseField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="sourceGreenhouse" className="text-sm font-medium">
        {h?.greenhouse ?? 'Greenhouse'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="sourceGreenhouse"
        type="text"
        placeholder={h?.enterGreenhouse ?? 'Enter greenhouse...'}
        value={formData.sourceGreenhouse}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, sourceGreenhouse: e.target.value }))
        }
        disabled={disabled}
        className={`h-10 ${errors.sourceGreenhouse ? 'border-destructive' : ''}`}
      />
      {errors.sourceGreenhouse && (
        <p className="text-destructive text-sm">{errors.sourceGreenhouse}</p>
      )}
    </div>
  );
}

export function SpeciesField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="species" className="text-sm font-medium">
        {h?.crop ?? 'Crop'} <span className="text-destructive">*</span>
      </Label>
      <Input
        id="species"
        type="text"
        placeholder={h?.enterCrop ?? 'Enter crop...'}
        value={formData.species}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, species: e.target.value }))
        }
        disabled={disabled}
        className={`h-10 ${errors.species ? 'border-destructive' : ''}`}
      />
      {errors.species && (
        <p className="text-destructive text-sm">{errors.species}</p>
      )}
    </div>
  );
}
