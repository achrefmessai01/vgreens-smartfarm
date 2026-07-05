'use client';

import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import * as React from 'react';
import { useCropsQuery } from '@/generated/graphql';
import { isTomatoSpecies } from '@/lib/harvest-utils';
import {
  GreenhouseField,
  CropField,
} from './create-batch-form-field-components';
import {
  CultivationAreaField,
  EndRowField,
  HeadsPerPlantField,
  HeadsPerSlabField,
  LostPlantsField,
  NumberOfRowsField,
  PlantsPerMeterField,
  PlantingDateField,
  ReplicatesField,
  RowLengthField,
  SlabLengthField,
  StartRowField,
  TotalPlantsField,
  VarietyField,
} from './create-batch-more-field-components';

interface CreateBatchFormFieldsProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

export function CreateBatchFormFields({
  formData,
  setFormData,
  errors,
  disabled = false,
}: CreateBatchFormFieldsProps) {
  // Resolve the selected crop's name (from the same greenhouse-scoped crop list
  // the CropField uses) to decide whether to surface the tomato-only
  // heads-per-plant field.
  const { data: cropsData } = useCropsQuery({
    variables: { greenhouseId: formData.sourceGreenhouse || undefined },
    skip: !formData.sourceGreenhouse,
  });
  const selectedCrop = cropsData?.crops?.find((c) => c.id === formData.cropId);
  const isTomato = isTomatoSpecies(selectedCrop?.name);

  return (
    <div className="space-y-4">
      <GreenhouseField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        disabled={disabled}
      />
      <CropField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        disabled={disabled}
      />
      <VarietyField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        disabled={disabled}
      />
      {/* Mostly-numeric fields are paired two-per-row (like Start/End Row) to
          cut the form's vertical footprint. Selects and the mode toggle stay
          full width. */}
      <div className="grid grid-cols-2 gap-4">
        <PlantingDateField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
        <CultivationAreaField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberOfRowsField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
        <RowLengthField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StartRowField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
        <EndRowField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PlantsPerMeterField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
        <TotalPlantsField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <LostPlantsField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
        <ReplicatesField
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
        />
      </div>
      {/* Tomato-only metadata: average heads per plant, plus slab length and
          heads per slab. Hidden for all other crops; optional even for
          tomatoes. */}
      {isTomato && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <HeadsPerPlantField
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              disabled={disabled}
            />
            <SlabLengthField
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <HeadsPerSlabField
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
