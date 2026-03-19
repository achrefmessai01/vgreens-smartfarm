'use client';

import * as React from 'react';
import {
  useUpdateHarvestMutation,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/lib/types/batch';

type HarvestItem = HarvestsQuery['harvests'][number];

function harvestToFormData(harvest: HarvestItem): BatchFormData {
  return {
    species: harvest.species,
    variety: harvest.variety,
    plantingDate: harvest.plantingDate
      ? new Date(harvest.plantingDate).toISOString().split('T')[0]
      : '',
    cultivationArea: harvest.cultivationArea,
    sourceGreenhouseId: harvest.greenhouse ?? '',
  };
}

function validateEditForm(data: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  if (!data.species) errors.species = 'Species is required';
  if (!data.variety) errors.variety = 'Variety is required';
  if (!data.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!data.cultivationArea || data.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!data.sourceGreenhouseId)
    errors.sourceGreenhouseId = 'Greenhouse selection is required';
  return errors;
}

interface UseEditHarvestOptions {
  onSuccess?: () => void;
}

export function useEditHarvest({ onSuccess }: UseEditHarvestOptions = {}) {
  const [formData, setFormData] = React.useState<BatchFormData>({
    species: '',
    variety: '',
    plantingDate: '',
    cultivationArea: 0,
    sourceGreenhouseId: '',
  });
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [harvestId, setHarvestId] = React.useState<string | null>(null);
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();

  const populate = React.useCallback((harvest: HarvestItem) => {
    setHarvestId(harvest.id);
    setFormData(harvestToFormData(harvest));
    setErrors({});
  }, []);

  const reset = React.useCallback(() => {
    setHarvestId(null);
    setFormData({ species: '', variety: '', plantingDate: '', cultivationArea: 0, sourceGreenhouseId: '' });
    setErrors({});
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateEditForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
      if (!harvestId) return;

      try {
        await updateHarvest({
          variables: {
            id: harvestId,
            input: {
              species: formData.species,
              variety: formData.variety,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouse: formData.sourceGreenhouseId,
              batch: `${formData.species} - ${formData.variety}`,
            },
          },
        });
        reset();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to update harvest:', err);
      }
    },
    [formData, harvestId, updateHarvest, reset, onSuccess],
  );

  return { formData, setFormData, errors, loading, populate, reset, handleSubmit };
}
