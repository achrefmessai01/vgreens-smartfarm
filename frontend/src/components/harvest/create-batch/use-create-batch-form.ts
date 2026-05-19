'use client';

import * as React from 'react';
import {
  HarvestStatus,
  useCreateHarvestMutation,
  type CreateHarvestMutation,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

type CreatedHarvest = CreateHarvestMutation['createHarvest'];

const INITIAL_FORM_DATA: BatchFormData = {
  species: '',
  variety: '',
  plantingDate: new Date().toISOString().split('T')[0],
  cultivationArea: 0,
  sourceGreenhouse: '',
  numberOfRows: 0,
  rowLength: 0,
  plantsPerMeter: 0,
  rowSpacing: 0,
  totalPlants: 0,
  lostPlants: 0,
};

function validateBatchForm(data: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  if (!data.species) errors.species = 'Species is required';
  if (!data.variety) errors.variety = 'Variety is required';
  if (!data.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!data.cultivationArea || data.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!data.sourceGreenhouse.trim())
    errors.sourceGreenhouse = 'Greenhouse is required';
  if (!data.numberOfRows || data.numberOfRows <= 0)
    errors.numberOfRows = 'Number of rows must be greater than 0';
  if (!data.rowLength || data.rowLength <= 0)
    errors.rowLength = 'Row length must be greater than 0';
  if (!data.plantsPerMeter || data.plantsPerMeter <= 0)
    errors.plantsPerMeter = 'Plants per meter must be greater than 0';
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
              greenhouse: formData.sourceGreenhouse.trim(),
              numberOfRows: formData.numberOfRows,
              rowLength: formData.rowLength,
              plantsPerMeter: formData.plantsPerMeter,
              rowSpacing: formData.rowSpacing,
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
