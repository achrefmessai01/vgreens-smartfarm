'use client';

import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import * as React from 'react';
import {
  GreenhouseField,
  CropField,
} from './create-batch-form-field-components';
import {
  CultivationAreaField,
  LostPlantsField,
  NumberOfRowsField,
  PlantsPerMeterField,
  PlantingDateField,
  ReplicatesField,
  RowLengthField,
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
  );
}
