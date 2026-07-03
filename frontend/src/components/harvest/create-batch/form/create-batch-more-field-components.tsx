'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { useVarietiesQuery } from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { FieldMessage } from '@/components/harvest/field-message';
import { AddVarietyDialog } from './add-variety-dialog';

// Sentinel value used by VarietyField's dropdown to open the "add variety"
// dialog instead of selecting an actual variety id.
const ADD_VARIETY_SENTINEL = '__add_variety__';

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
// so the field is disabled until a crop is picked. The dropdown ends with a
// "+ Add new variety..." sentinel option that opens AddVarietyDialog so users
// can add a missing variety inline (admin-gated on the backend).
export function VarietyField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;
  const cropId = formData.cropId;
  const { data, loading, refetch } = useVarietiesQuery({
    variables: { cropId },
    skip: !cropId,
  });
  const varieties = data?.varieties ?? [];
  const [addOpen, setAddOpen] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="varietyId" className="text-sm font-medium">
        {h?.variety ?? 'Variety'}
      </Label>
      <select
        id="varietyId"
        value={formData.varietyId}
        onChange={(e) => {
          const value = e.target.value;
          if (value === ADD_VARIETY_SENTINEL) {
            // Don't write the sentinel to form state; open the dialog instead.
            setAddOpen(true);
            return;
          }
          setFormData((prev) => ({ ...prev, varietyId: value }));
        }}
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
        {cropId && (
          <option value={ADD_VARIETY_SENTINEL}>
            {h?.addVarietyOption ?? '+ Add new variety...'}
          </option>
        )}
      </select>
      <FieldMessage>{errors.varietyId}</FieldMessage>
      {cropId && (
        <AddVarietyDialog
          open={addOpen}
          cropId={cropId}
          onOpenChange={setAddOpen}
          onCreated={async (variety) => {
            // Make the new variety visible in the dropdown, then auto-select it
            // so the user can immediately continue with the form.
            await refetch();
            setFormData((prev) => ({ ...prev, varietyId: variety.id }));
          }}
        />
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
      <FieldMessage>{errors.plantingDate}</FieldMessage>
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
      <DecimalInput
        id="cultivationArea"
        placeholder={h?.enterArea ?? 'Enter area in square meters'}
        value={formData.cultivationArea}
        onChange={(v) =>
          setFormData((prev) => ({ ...prev, cultivationArea: v }))
        }
        disabled={disabled}
        className={`h-10 ${errors.cultivationArea ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.cultivationArea}</FieldMessage>
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
      <DecimalInput
        id="numberOfRows"
        value={formData.numberOfRows}
        onChange={(v) => setFormData((prev) => ({ ...prev, numberOfRows: v }))}
        disabled={disabled}
        className={`h-10 ${errors.numberOfRows ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.numberOfRows}</FieldMessage>
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
      <DecimalInput
        id="rowLength"
        value={formData.rowLength}
        onChange={(v) => setFormData((prev) => ({ ...prev, rowLength: v }))}
        disabled={disabled}
        className={`h-10 ${errors.rowLength ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.rowLength}</FieldMessage>
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
      <DecimalInput
        id="plantsPerMeter"
        value={formData.plantsPerMeter}
        onChange={(v) =>
          setFormData((prev) => ({ ...prev, plantsPerMeter: v }))
        }
        disabled={disabled}
        className={`h-10 ${errors.plantsPerMeter ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.plantsPerMeter}</FieldMessage>
    </div>
  );
}

// Optional row-range bounds (start/end) that define which contiguous block of
// physical rows the batch occupies. Float to match the per-harvest rowX/rowY
// representation; 0 means "unset" so a batch without a range stays unconstrained.
export function StartRowField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="startRow" className="text-sm font-medium">
        {h?.startRow ?? 'Start Row'}
      </Label>
      <Input
        id="startRow"
        type="number"
        min="0"
        step="1"
        placeholder={h?.enterStartRow ?? 'First row of the batch'}
        value={formData.startRow || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            startRow: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.startRow ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.startRow}</FieldMessage>
    </div>
  );
}

export function EndRowField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="endRow" className="text-sm font-medium">
        {h?.endRow ?? 'End Row'}
      </Label>
      <Input
        id="endRow"
        type="number"
        min="0"
        step="1"
        placeholder={h?.enterEndRow ?? 'Last row of the batch'}
        value={formData.endRow || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            endRow: parsePositiveNumber(e.target.value),
          }))
        }
        disabled={disabled}
        className={`h-10 ${errors.endRow ? 'border-destructive' : ''}`}
      />
      <FieldMessage>{errors.endRow}</FieldMessage>
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
      <FieldMessage>{errors.totalPlants}</FieldMessage>
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
      <FieldMessage>{errors.lostPlants}</FieldMessage>
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
      <FieldMessage>{errors.replicates}</FieldMessage>
    </div>
  );
}

// Average number of heads per plant. Tomato-only metadata, never required: it's
// rendered only when the selected crop is a tomato (gated by the parent) and an
// empty value (0) is persisted as null. No required marker, no validation.
export function HeadsPerPlantField({
  formData,
  setFormData,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="avgHeadsPerPlant" className="text-sm font-medium">
        {h?.avgHeadsPerPlant ?? 'Avg Heads per Plant'}
      </Label>
      <DecimalInput
        id="avgHeadsPerPlant"
        value={formData.avgHeadsPerPlant}
        onChange={(v) => setFormData((prev) => ({ ...prev, avgHeadsPerPlant: v }))}
        disabled={disabled}
        className="h-10"
      />
    </div>
  );
}

// Length of a slab (cm). Tomato-only metadata, never required: it's rendered
// only when the selected crop is a tomato (gated by the parent) and an empty
// value (0) is persisted as null. No required marker, no validation.
export function SlabLengthField({
  formData,
  setFormData,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="slabLength" className="text-sm font-medium">
        {h?.slabLength ?? 'Slab Length (cm)'}
      </Label>
      <DecimalInput
        id="slabLength"
        value={formData.slabLength}
        onChange={(v) => setFormData((prev) => ({ ...prev, slabLength: v }))}
        disabled={disabled}
        className="h-10"
      />
    </div>
  );
}

// Number of heads per slab. Tomato-only metadata, never required: it's rendered
// only when the selected crop is a tomato (gated by the parent) and an empty
// value (0) is persisted as null. Whole-number input; no validation.
export function HeadsPerSlabField({
  formData,
  setFormData,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  return (
    <div className="space-y-2">
      <Label htmlFor="headsPerSlab" className="text-sm font-medium">
        {h?.headsPerSlab ?? 'Heads per Slab'}
      </Label>
      <Input
        id="headsPerSlab"
        type="number"
        min="0"
        step="1"
        value={formData.headsPerSlab || ''}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            headsPerSlab: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
          }))
        }
        disabled={disabled}
        className="h-10"
      />
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
