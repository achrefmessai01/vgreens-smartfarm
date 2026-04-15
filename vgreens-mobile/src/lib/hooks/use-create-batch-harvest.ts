import { useState, useCallback } from 'react';
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
  sourceGreenhouseId: '',
});

function validate(data: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  if (!data.species) errors.species = 'Species is required';
  if (!data.variety) errors.variety = 'Variety is required';
  if (!data.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!data.cultivationArea || data.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!data.sourceGreenhouseId)
    errors.sourceGreenhouseId = 'Greenhouse is required';
  return errors;
}

export function useCreateBatchHarvest(onSuccess?: (h: CreatedHarvest) => void) {
  const [formData, setFormData] = useState<BatchFormData>(initialForm);
  const [errors, setErrors] = useState<BatchFormErrors>({});
  const [createHarvest, { loading }] = useCreateHarvestMutation();

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
  }, [formData, createHarvest, reset, onSuccess]);

  return { formData, setFormData, errors, loading, reset, submit };
}
