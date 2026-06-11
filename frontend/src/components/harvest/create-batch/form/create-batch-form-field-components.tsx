'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGreenhousesQuery } from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

interface FormFieldProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

// Greenhouses are first-class rows now: pick one (its id is stored in
// sourceGreenhouse) rather than typing a free-text name.
export function GreenhouseField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { data, loading } = useGreenhousesQuery();
  const greenhouses = data?.greenhouses ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor="sourceGreenhouse" className="text-sm font-medium">
        {h?.greenhouse ?? 'Greenhouse'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <select
        id="sourceGreenhouse"
        value={formData.sourceGreenhouse}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, sourceGreenhouse: e.target.value }))
        }
        disabled={disabled || loading}
        className={`border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          errors.sourceGreenhouse ? 'border-destructive' : ''
        }`}
      >
        <option value="">
          {h?.enterGreenhouse ?? 'Select greenhouse...'}
        </option>
        {greenhouses.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
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
