'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Label } from '@/components/ui/label';
import { useGreenhousesQuery, useCropsQuery } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { FieldMessage } from '@/components/harvest/field-message';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';

interface FormFieldProps {
  formData: BatchFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  disabled?: boolean;
}

// Greenhouses are first-class rows now: pick one (its id is stored in
// sourceGreenhouse) rather than typing a free-text name.
export function GreenhouseField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  // Scope to the tenant the batch will belong to (the current user's tenant).
  // For a VGREENS_ADMIN the greenhouses query is otherwise unscoped and would
  // return every tenant's greenhouses, so pass the tenantId explicitly.
  const { user } = useCurrentUser();
  const { data, loading } = useGreenhousesQuery({
    variables: { tenantId: user?.tenantId ?? undefined },
    skip: !user?.tenantId,
  });
  const greenhouses = data?.greenhouses ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor="sourceGreenhouse" className="text-sm font-medium">
        {h?.greenhouse ?? 'Greenhouse'}{' '}
        <span className="text-destructive">*</span>
      </Label>
      <select
        id="sourceGreenhouse"
        value={formData.sourceGreenhouse}
        onChange={(e) =>
          // Changing the greenhouse invalidates the crop (and therefore the
          // variety) chosen below it — reset both.
          setFormData((prev) => ({
            ...prev,
            sourceGreenhouse: e.target.value,
            cropId: '',
            varietyId: '',
          }))
        }
        disabled={disabled || loading}
        className={`border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          errors.sourceGreenhouse ? 'border-destructive' : ''
        }`}
      >
        <option value="">{h?.enterGreenhouse ?? 'Select greenhouse...'}</option>
        {greenhouses.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <FieldMessage>{errors.sourceGreenhouse}</FieldMessage>
    </div>
  );
}

// Crop selector. Only the crops assigned to the chosen greenhouse (via
// greenhouse_crops) are offered, so the field is disabled until a greenhouse is
// picked. Changing the crop resets the variety chosen below it.
export function CropField({
  formData,
  setFormData,
  errors,
  disabled = false,
}: FormFieldProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const greenhouseId = formData.sourceGreenhouse;
  const { data, loading } = useCropsQuery({
    variables: { greenhouseId: greenhouseId || undefined },
    skip: !greenhouseId,
  });
  const crops = data?.crops ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor="cropId" className="text-sm font-medium">
        {h?.crop ?? 'Crop'} <span className="text-destructive">*</span>
      </Label>
      <select
        id="cropId"
        value={formData.cropId}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            cropId: e.target.value,
            varietyId: '',
          }))
        }
        disabled={disabled || !greenhouseId || loading}
        className={`border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          errors.cropId ? 'border-destructive' : ''
        }`}
      >
        <option value="">
          {greenhouseId
            ? (h?.enterCrop ?? 'Select crop...')
            : (h?.selectGreenhouseFirst ?? 'Select a greenhouse first')}
        </option>
        {crops.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <FieldMessage>{errors.cropId}</FieldMessage>
    </div>
  );
}
