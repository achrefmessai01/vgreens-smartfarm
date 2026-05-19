import { useCallback, useEffect, useState } from 'react';
import {
  useUpdateHarvestMutation,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';

type HarvestItem = HarvestsQuery['harvests'][number];

const emptyForm = (): BatchFormData => ({
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
});

function toForm(h: HarvestItem): BatchFormData {
  return {
    species: h.species,
    variety: h.variety,
    plantingDate: h.plantingDate
      ? new Date(h.plantingDate).toISOString().split('T')[0]
      : '',
    cultivationArea: h.cultivationArea,
    sourceGreenhouse: h.greenhouse ?? '',
    numberOfRows: h.numberOfRows,
    rowLength: h.rowLength,
    plantsPerMeter: h.plantsPerMeter,
    rowSpacing: h.rowSpacing,
    totalPlants: h.totalPlants,
    lostPlants: h.lostPlants,
  };
}

function validate(d: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  if (!d.species) errors.species = 'Species is required';
  if (!d.variety) errors.variety = 'Variety is required';
  if (!d.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!d.cultivationArea || d.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!d.sourceGreenhouse.trim())
    errors.sourceGreenhouse = 'Greenhouse is required';
  if (!d.numberOfRows || d.numberOfRows <= 0)
    errors.numberOfRows = 'Number of rows must be greater than 0';
  if (!d.rowLength || d.rowLength <= 0)
    errors.rowLength = 'Row length must be greater than 0';
  if (!d.plantsPerMeter || d.plantsPerMeter <= 0)
    errors.plantsPerMeter = 'Plants per meter must be greater than 0';
  return errors;
}

function computeRowSpacing(d: BatchFormData): number {
  const denom = d.numberOfRows * d.rowLength;
  return denom > 0 ? Number((d.cultivationArea / denom).toFixed(4)) : 0;
}

export function useEditHarvest(onSuccess?: () => void) {
  const [formData, setFormData] = useState<BatchFormData>(emptyForm);
  const [errors, setErrors] = useState<BatchFormErrors>({});
  const [harvestId, setHarvestId] = useState<string | null>(null);
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();

  useEffect(() => {
    setFormData((prev) => {
      const next = computeRowSpacing(prev);
      return next === prev.rowSpacing ? prev : { ...prev, rowSpacing: next };
    });
  }, [formData.cultivationArea, formData.numberOfRows, formData.rowLength]);

  const populate = useCallback((h: HarvestItem) => {
    setHarvestId(h.id);
    setFormData(toForm(h));
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setHarvestId(null);
    setFormData(emptyForm());
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
          greenhouse: formData.sourceGreenhouse.trim(),
          numberOfRows: formData.numberOfRows,
          rowLength: formData.rowLength,
          plantsPerMeter: formData.plantsPerMeter,
          rowSpacing: formData.rowSpacing,
          totalPlants: formData.totalPlants,
          lostPlants: formData.lostPlants,
          batch: `${formData.species} - ${formData.variety}`,
        },
      },
    });
    reset();
    onSuccess?.();
  }, [formData, harvestId, updateHarvest, reset, onSuccess]);

  return { formData, setFormData, errors, loading, populate, reset, submit };
}
