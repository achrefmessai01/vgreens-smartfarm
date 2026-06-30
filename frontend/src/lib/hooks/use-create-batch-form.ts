'use client';

import * as React from 'react';
import {
  BatchStatus,
  InputMode,
  useCreateBatchMutation,
  type CreateBatchMutation,
} from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

type CreatedBatch = CreateBatchMutation['createBatch'];

const INITIAL_FORM_DATA: BatchFormData = {
  sourceGreenhouse: '',
  cropId: '',
  varietyId: '',
  plantingDate: new Date().toISOString().split('T')[0],
  cultivationArea: 0,
  numberOfRows: 0,
  rowLength: 0,
  plantsPerMeter: 0,
  rowSpacing: 0,
  startRow: 0,
  endRow: 0,
  totalPlants: 0,
  lostPlants: 0,
  replicates: 1,
  avgHeadsPerPlant: 0,
  slabLength: 0,
  headsPerSlab: 0,
  inputMode: InputMode.Weight,
};

function computeRowSpacing(data: BatchFormData): number {
  const denominator = data.numberOfRows * data.rowLength;
  if (denominator <= 0) return 0;
  return Number((data.cultivationArea / denominator).toFixed(4));
}

function validateBatchForm(data: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  // sourceGreenhouse / cropId hold the selected entity ids; variety is optional.
  if (!data.sourceGreenhouse.trim())
    errors.sourceGreenhouse = 'Greenhouse is required';
  if (!data.cropId) errors.cropId = 'Crop is required';
  if (!data.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!data.cultivationArea || data.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!data.numberOfRows || data.numberOfRows <= 0)
    errors.numberOfRows = 'Number of rows must be greater than 0';
  if (!data.rowLength || data.rowLength <= 0)
    errors.rowLength = 'Row length must be greater than 0';
  if (!data.plantsPerMeter || data.plantsPerMeter <= 0)
    errors.plantsPerMeter = 'Plants per meter must be greater than 0';
  if (!data.replicates || data.replicates < 1)
    errors.replicates = 'Replicates must be at least 1';
  validateRowRange(data, errors);
  return errors;
}

// The batch row range is optional (backfilled by hand), but if either bound is
// entered the pair must be complete and ordered (start <= end), with positive
// row numbers. Shared by the create and edit batch forms.
export function validateRowRange(
  data: BatchFormData,
  errors: BatchFormErrors,
): void {
  const hasStart = data.startRow > 0;
  const hasEnd = data.endRow > 0;
  if (!hasStart && !hasEnd) return;
  if (!hasStart) errors.startRow = 'Start row is required when end row is set';
  if (!hasEnd) errors.endRow = 'End row is required when start row is set';
  if (hasStart && hasEnd && data.startRow > data.endRow) {
    errors.endRow = 'End row must be greater than or equal to start row';
  }
}

interface UseCreateBatchFormOptions {
  onSuccess?: (batch: CreatedBatch) => void;
}

export function useCreateBatchForm({
  onSuccess,
}: UseCreateBatchFormOptions = {}) {
  const [formData, setFormData] =
    React.useState<BatchFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [createBatch, { loading }] = useCreateBatchMutation();
  const tenantId = useTenantIdVariable();

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
        const rowSpacing = computeRowSpacing(formData);
        const { data } = await createBatch({
          variables: {
            input: {
              cropId: formData.cropId,
              varietyId: formData.varietyId || undefined,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouseId: formData.sourceGreenhouse.trim() || undefined,
              numberOfRows: formData.numberOfRows,
              rowLength: formData.rowLength,
              plantsPerMeter: formData.plantsPerMeter,
              rowSpacing,
              startRow: formData.startRow || undefined,
              endRow: formData.endRow || undefined,
              totalPlants: formData.totalPlants,
              lostPlants: formData.lostPlants,
              replicates: formData.replicates,
              // Tomato-only, never required: 0 means unset → store null.
              avgHeadsPerPlant: formData.avgHeadsPerPlant || undefined,
              slabLength: formData.slabLength || undefined,
              headsPerSlab: formData.headsPerSlab || undefined,
              // crateWeight is no longer set on the batch — crate weight is
              // chosen per-harvest from the tenant's crates.
              inputMode: formData.inputMode,
              status: BatchStatus.Active,
              tenantId,
            },
          },
        });
        if (data?.createBatch) {
          reset();
          onSuccess?.(data.createBatch);
        }
      } catch (err) {
        console.error('Failed to create batch:', err);
      }
    },
    [formData, createBatch, reset, onSuccess, tenantId],
  );

  return { formData, setFormData, errors, loading, reset, handleSubmit };
}
