'use client';

import {
  HarvestStatus,
  useCreateHarvestMutation,
  type CreateHarvestMutation,
} from '@/generated/graphql';
import * as React from 'react';
import type { BatchFormData, BatchFormErrors } from '@/lib/types/batch';

type CreatedHarvest = CreateHarvestMutation['createHarvest'];

const INITIAL_FORM_DATA: BatchFormData = {
  species: '',
  variety: '',
  plantingDate: new Date().toISOString().split('T')[0],
  cultivationArea: 0,
  sourceGreenhouseId: '',
};

function validateBatchForm(data: BatchFormData): BatchFormErrors {
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

interface UseCreateBatchFormOptions {
  onSuccess?: (harvest: CreatedHarvest) => void;
}

export function useCreateBatchForm({
  onSuccess,
}: UseCreateBatchFormOptions = {}) {
  const [formData, setFormData] =
    React.useState<BatchFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [createHarvest, { loading }] = useCreateHarvestMutation();

  const reset = React.useCallback(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      plantingDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateBatchForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      try {
        const { data } = await createHarvest({
          variables: {
            input: {
              species: formData.species,
              variety: formData.variety,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouse: formData.sourceGreenhouseId,
              date: new Date().toISOString(),
              status: HarvestStatus.Draft,
            },
          },
        });
        if (data?.createHarvest) {
          reset();
          onSuccess?.(data.createHarvest);
        }
      } catch (err) {
        console.error('Failed to create batch:', err);
      }
    },
    [formData, createHarvest, reset, onSuccess],
  );

  return { formData, setFormData, errors, loading, reset, handleSubmit };
}
