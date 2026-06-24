'use client';

import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import * as React from 'react';
import {
  GreenhouseField,
  CropField,
} from './create-batch-form-field-components';
import {
  CultivationAreaField,
  EndRowField,
  InputModeField,
  LostPlantsField,
  NumberOfRowsField,
  PlantsPerMeterField,
  PlantingDateField,
  ReplicatesField,
  RowLengthField,
  StartRowField,
  TotalPlantsField,
  VarietyField,
} from './create-batch-more-field-components';

interface CreateBatchFormFieldsProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
  // Lock the input-mode toggle (edit flow): mode is fixed at creation.
  lockMode?: boolean;
}

export function CreateBatchFormFields({
  formData,
  setFormData,
  errors,
  disabled = false,
  lockMode = false,
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
      <InputModeField
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        disabled={disabled}
        lockMode={lockMode}
      />
    </div>
  );
}
