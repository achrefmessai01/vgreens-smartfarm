import { useState, useCallback } from 'react';
import {
  useUpdateHarvestMutation,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';

type HarvestItem = HarvestsQuery['harvests'][number];

function toForm(harvest: HarvestItem): BatchFormData {
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

export function useEditHarvest(onSuccess?: () => void) {
  const [formData, setFormData] = useState<BatchFormData>({
    species: '',
    variety: '',
    plantingDate: '',
    cultivationArea: 0,
    sourceGreenhouseId: '',
  });
  const [errors, setErrors] = useState<BatchFormErrors>({});
  const [harvestId, setHarvestId] = useState<string | null>(null);
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();

  const populate = useCallback((harvest: HarvestItem) => {
    setHarvestId(harvest.id);
    setFormData(toForm(harvest));
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setHarvestId(null);
    setFormData({
      species: '',
      variety: '',
      plantingDate: '',
      cultivationArea: 0,
      sourceGreenhouseId: '',
    });
    setErrors({});
  }, []);

  const submit = useCallback(async () => {
    const e = validate(formData);
    setErrors(e);
    if (Object.keys(e).length > 0 || !harvestId) return;
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
  }, [formData, harvestId, updateHarvest, reset, onSuccess]);

  return { formData, setFormData, errors, loading, populate, reset, submit };
}
