'use client';

import * as React from 'react';
import {
  useUpdateHarvestMutation,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

type HarvestItem = HarvestsQuery['harvests'][number];

function computeRowSpacing(data: BatchFormData): number {
  const denominator = data.numberOfRows * data.rowLength;
  if (denominator <= 0) return 0;
  return Number((data.cultivationArea / denominator).toFixed(4));
}

function harvestToFormData(harvest: HarvestItem): BatchFormData {
  return {
    species: harvest.species,
    variety: harvest.variety,
    plantingDate: harvest.plantingDate
      ? new Date(harvest.plantingDate).toISOString().split('T')[0]
      : '',
    cultivationArea: harvest.cultivationArea,
    sourceGreenhouse: harvest.greenhouse ?? '',
    numberOfRows: harvest.numberOfRows,
    rowLength: harvest.rowLength,
    plantsPerMeter: harvest.plantsPerMeter,
    rowSpacing: harvest.rowSpacing,
  };
}

function validateEditForm(data: BatchFormData): BatchFormErrors {
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

interface UseEditHarvestOptions {
  onSuccess?: () => void;
}

export function useEditHarvest({ onSuccess }: UseEditHarvestOptions = {}) {
  const [formData, setFormData] = React.useState<BatchFormData>({
    species: '',
    variety: '',
    plantingDate: '',
    cultivationArea: 0,
    sourceGreenhouse: '',
    numberOfRows: 0,
    rowLength: 0,
    plantsPerMeter: 0,
    rowSpacing: 0,
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
    setFormData({
      species: '',
      variety: '',
      plantingDate: '',
      cultivationArea: 0,
      sourceGreenhouse: '',
      numberOfRows: 0,
      rowLength: 0,
      plantsPerMeter: 0,
      rowSpacing: 0,
    });
    setErrors({});
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateEditForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0 || !harvestId) return;

      try {
        const rowSpacing = computeRowSpacing(formData);
        await updateHarvest({
          variables: {
            id: harvestId,
            input: {
              species: formData.species,
              variety: formData.variety,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouse: formData.sourceGreenhouse.trim(),
              numberOfRows: formData.numberOfRows,
              rowLength: formData.rowLength,
              plantsPerMeter: formData.plantsPerMeter,
              rowSpacing,
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

  return {
    formData,
    setFormData,
    errors,
    loading,
    populate,
    reset,
    handleSubmit,
  };
}
