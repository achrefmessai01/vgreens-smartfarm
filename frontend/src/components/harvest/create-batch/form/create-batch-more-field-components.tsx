'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { useVarietiesQuery } from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

interface FormFieldProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

function parsePositiveNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

// Variety selector. Optional, and scoped to the varieties of the chosen crop,
// so the field is disabled until a crop is picked.
export function VarietyField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const cropId = formData.cropId;
  const { data, loading } = useVarietiesQuery({
    variables: { cropId },
    skip: !cropId,
  });
  const varieties = data?.varieties ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor="varietyId" className="text-sm font-medium">
        {h?.variety ?? 'Variety'}
      </Label>
      <select
        id="varietyId"
        value={formData.varietyId}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, varietyId: e.target.value }))
        }
        disabled={disabled || !cropId || loading}
        className={`border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          errors.varietyId ? 'border-destructive' : ''
        }`}
      >
        <option value="">
          {cropId
            ? (h?.enterVariety ?? 'Select variety (optional)...')
            : (h?.selectCropFirst ?? 'Select a crop first')}
        </option>
        {varieties.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      {errors.varietyId && (
        <p className="text-destructive text-sm">{errors.varietyId}</p>
      )}
    </div>
  );
}

export function PlantingDateField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="plantingDate" className="text-sm font-medium">
        {h?.plantingDate ?? 'Planting Date'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="plantingDate"
        type="date"
        value={formData.plantingDate}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, plantingDate: e.target.value }))
        }
        disabled={disabled}
        className={`h-10 ${errors.plantingDate ? 'border-destructive' : ''}`}
      />
      {errors.plantingDate && (
        <p className="text-destructive text-sm">{errors.plantingDate}</p>
      )}
    </div>
  );
}

export function CultivationAreaField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="cultivationArea" className="text-sm font-medium">
        {h?.cultivationArea ?? 'Cultivation Area (m²)'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="cultivationArea"
        type="number"
        min="0"
        step="0.1"
        placeholder={h?.enterArea ?? 'Enter area in square meters'}
        value={formData.cultivationArea || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            cultivationArea: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.cultivationArea ? 'border-destructive' : ''}`}
      />
      {errors.cultivationArea && (
        <p className="text-destructive text-sm">{errors.cultivationArea}</p>
      )}
    </div>
  );
}

export function NumberOfRowsField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="numberOfRows" className="text-sm font-medium">
        {h?.numberOfRows ?? 'Number of Rows'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="numberOfRows"
        type="number"
        min="0"
        step="0.1"
        value={formData.numberOfRows || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            numberOfRows: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.numberOfRows ? 'border-destructive' : ''}`}
      />
      {errors.numberOfRows && (
        <p className="text-destructive text-sm">{errors.numberOfRows}</p>
      )}
    </div>
  );
}

export function RowLengthField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="rowLength" className="text-sm font-medium">
        {h?.rowLength ?? 'Row Length (m)'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="rowLength"
        type="number"
        min="0"
        step="0.1"
        value={formData.rowLength || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            rowLength: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.rowLength ? 'border-destructive' : ''}`}
      />
      {errors.rowLength && (
        <p className="text-destructive text-sm">{errors.rowLength}</p>
      )}
    </div>
  );
}

export function PlantsPerMeterField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="plantsPerMeter" className="text-sm font-medium">
        {h?.plantsPerMeter ?? 'Plants per Meter'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id="plantsPerMeter"
        type="number"
        min="0"
        step="0.1"
        value={formData.plantsPerMeter || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            plantsPerMeter: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.plantsPerMeter ? 'border-destructive' : ''}`}
      />
      {errors.plantsPerMeter && (
        <p className="text-destructive text-sm">{errors.plantsPerMeter}</p>
      )}
    </div>
  );
}

export function TotalPlantsField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const touchedRef = React.useRef(formData.totalPlants > 0);

  const computed = React.useMemo(() => {
    const v =
      formData.rowLength * formData.plantsPerMeter * formData.numberOfRows;
    return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
  }, [formData.rowLength, formData.plantsPerMeter, formData.numberOfRows]);

  React.useEffect(() => {
    if (!touchedRef.current && computed !== formData.totalPlants) {
      setFormData((prev) => ({ ...prev, totalPlants: computed }));
    }
  }, [computed, formData.totalPlants, setFormData]);

  return (
    <div className="space-y-2">
      <Label htmlFor="totalPlants" className="text-sm font-medium">
        {h?.totalPlants ?? 'Total Plants'}
      </Label>
      <Input
        id="totalPlants"
        type="number"
        min="0"
        step="1"
        value={formData.totalPlants || ''}
        onChange={(e) => {
          touchedRef.current = true;
          setFormData((prev) => ({
            ...prev,
            totalPlants: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
          }));
        }}
        disabled={disabled}
        className={`h-10 ${errors.totalPlants ? 'border-destructive' : ''}`}
      />
      {errors.totalPlants && (
        <p className="text-destructive text-sm">{errors.totalPlants}</p>
      )}
    </div>
  );
}

export function LostPlantsField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="lostPlants" className="text-sm font-medium">
        {h?.lostPlants ?? 'Lost Plants'}
      </Label>
      <Input
        id="lostPlants"
        type="number"
        min="0"
        step="1"
        value={formData.lostPlants || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            lostPlants: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.lostPlants ? 'border-destructive' : ''}`}
      />
      {errors.lostPlants && (
        <p className="text-destructive text-sm">{errors.lostPlants}</p>
      )}
    </div>
  );
}

export function ReplicatesField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="replicates" className="text-sm font-medium">
        {h?.replicates ?? 'Replicates'}
      </Label>
      <Input
        id="replicates"
        type="number"
        min="1"
        step="1"
        value={formData.replicates || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            replicates: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.replicates ? 'border-destructive' : ''}`}
      />
      {errors.replicates && (
        <p className="text-destructive text-sm">{errors.replicates}</p>
      )}
    </div>
  );
}

export function RowSpacingField({
  formData,
  setFormData,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  React.useEffect(() => {
    const denominator = formData.numberOfRows * formData.rowLength;
    const nextRowSpacing =
      denominator > 0
        ? Number((formData.cultivationArea / denominator).toFixed(4))
        : 0;
    if (nextRowSpacing !== formData.rowSpacing) {
      setFormData((prev) => ({ ...prev, rowSpacing: nextRowSpacing }));
    }
  }, [
    formData.cultivationArea,
    formData.numberOfRows,
    formData.rowLength,
    formData.rowSpacing,
    setFormData,
  ]);

  return (
    <div className="space-y-2">
      <Label htmlFor="rowSpacing" className="text-sm font-medium">
        {h?.rowSpacing ?? 'Row Spacing (Auto-calculated)'}
      </Label>
      <Input
        id="rowSpacing"
        type="number"
        readOnly
        value={formData.rowSpacing || 0}
        disabled={disabled}
        className="bg-muted/40 h-10"
      />
    </div>
  );
}
