import { useCallback, useEffect, useState } from 'react';
import {
  HarvestStatus,
  useCreateHarvestMutation,
  type CreateHarvestMutation,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';

type CreatedHarvest = CreateHarvestMutation['createHarvest'];

const initialForm = (): BatchFormData => ({
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
});

function validate(data: BatchFormData): BatchFormErrors {
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

function computeRowSpacing(data: BatchFormData): number {
  const denom = data.numberOfRows * data.rowLength;
  return denom > 0 ? Number((data.cultivationArea / denom).toFixed(4)) : 0;
}

export function useCreateBatchHarvest(onSuccess?: (h: CreatedHarvest) => void) {
  const [formData, setFormData] = useState<BatchFormData>(initialForm);
  const [errors, setErrors] = useState<BatchFormErrors>({});
  const [createHarvest, { loading }] = useCreateHarvestMutation();

  // Auto-compute rowSpacing whenever dependencies change.
  useEffect(() => {
    setFormData((prev) => {
      const next = computeRowSpacing(prev);
      return next === prev.rowSpacing ? prev : { ...prev, rowSpacing: next };
    });
  }, [formData.cultivationArea, formData.numberOfRows, formData.rowLength]);

  const reset = useCallback(() => {
    setFormData(initialForm());
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const e = validate(formData);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
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
          totalPlants: formData.totalPlants,
          lostPlants: formData.lostPlants,
          date: new Date().toISOString(),
          status: HarvestStatus.Draft,
        },
      },
    });
    if (data?.createHarvest) {
      reset();
      onSuccess?.(data.createHarvest);
    }
  }, [formData, createHarvest, reset, onSuccess]);

  return { formData, setFormData, errors, loading, reset, submit };
}
