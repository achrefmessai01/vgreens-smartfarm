'use client';

import * as React from 'react';
import {
  useUpdateBatchMutation,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

type HarvestItem = HarvestsQuery['harvests'][number];

const EMPTY_FORM: BatchFormData = {
  species: '',
  variety: '',
  plantingDate: '',
  cultivationArea: 0,
  sourceGreenhouse: '',
  numberOfRows: 0,
  rowLength: 0,
  plantsPerMeter: 0,
  rowSpacing: 0,
  totalPlants: 0,
  lostPlants: 0,
};

function computeRowSpacing(data: BatchFormData): number {
  const denominator = data.numberOfRows * data.rowLength;
  if (denominator <= 0) return 0;
  return Number((data.cultivationArea / denominator).toFixed(4));
}

// Pull the editable planting fields off a harvest's parent batch.
function harvestToFormData(harvest: HarvestItem): BatchFormData {
  const batch = harvest.batch;
  return {
    species: batch?.species ?? '',
    variety: batch?.variety ?? '',
    plantingDate: batch?.plantingDate
      ? new Date(batch.plantingDate).toISOString().split('T')[0]
      : '',
    cultivationArea: batch?.cultivationArea ?? 0,
    sourceGreenhouse: batch?.greenhouseId ?? '',
    numberOfRows: batch?.numberOfRows ?? 0,
    rowLength: batch?.rowLength ?? 0,
    plantsPerMeter: batch?.plantsPerMeter ?? 0,
    rowSpacing: batch?.rowSpacing ?? 0,
    totalPlants: batch?.totalPlants ?? 0,
    lostPlants: batch?.lostPlants ?? 0,
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

// Despite the name (kept for call-site stability) this edits the parent BATCH:
// the planting-level data now lives on the batches table.
export function useEditHarvest({ onSuccess }: UseEditHarvestOptions = {}) {
  const [formData, setFormData] = React.useState<BatchFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [batchId, setBatchId] = React.useState<string | null>(null);
  const [updateBatch, { loading }] = useUpdateBatchMutation();

  const populate = React.useCallback((harvest: HarvestItem) => {
    setBatchId(harvest.batchId);
    setFormData(harvestToFormData(harvest));
    setErrors({});
  }, []);

  const reset = React.useCallback(() => {
    setBatchId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateEditForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0 || !batchId) return;

      try {
        const rowSpacing = computeRowSpacing(formData);
        await updateBatch({
          variables: {
            id: batchId,
            input: {
              species: formData.species,
              variety: formData.variety,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouseId: formData.sourceGreenhouse.trim() || undefined,
              numberOfRows: formData.numberOfRows,
              rowLength: formData.rowLength,
              plantsPerMeter: formData.plantsPerMeter,
              rowSpacing,
              totalPlants: formData.totalPlants,
              lostPlants: formData.lostPlants,
              name: `${formData.species} - ${formData.variety}`,
            },
          },
        });
        reset();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to update batch:', err);
      }
    },
    [formData, batchId, updateBatch, reset, onSuccess],
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
