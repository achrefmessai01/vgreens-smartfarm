'use client';

import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import * as React from 'react';
import {
  GreenhouseField,
  SpeciesField,
} from './create-batch-form-field-components';
import {
  CultivationAreaField,
  NumberOfRowsField,
  PlantsPerMeterField,
  PlantingDateField,
  RowLengthField,
  RowSpacingField,
  VarietyField,
} from './create-batch-more-field-components';

interface CreateBatchFormFieldsProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
}

export function CreateBatchFormFields({
  formData,
  setFormData,
  errors,
}: CreateBatchFormFieldsProps) {
  return (
    <div className="space-y-4">
      <GreenhouseField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <SpeciesField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <VarietyField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <PlantingDateField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <CultivationAreaField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <NumberOfRowsField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <RowLengthField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <PlantsPerMeterField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      <RowSpacingField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
    </div>
  );
}
