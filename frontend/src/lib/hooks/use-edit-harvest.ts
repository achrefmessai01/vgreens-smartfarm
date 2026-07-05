'use client';

import * as React from 'react';
import {
  useUpdateBatchMutation,
  type BatchesQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { validateRowRange } from '@/lib/hooks/use-create-batch-form';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { useToast } from '@/components/ui/toast-provider';

type BatchItem = BatchesQuery['batches'][number];

const EMPTY_FORM: BatchFormData = {
  sourceGreenhouse: '',
  cropId: '',
  varietyId: '',
  plantingDate: '',
  cultivationArea: 0,
  numberOfRows: 0,
  rowLength: 0,
  plantsPerMeter: 0,
  rowSpacing: 0,
  startRow: 0,
  endRow: 0,
  totalPlants: 0,
  lostPlants: 0,
  replicates: 1,
  avgHeadsPerPlant: 0,
  slabLength: 0,
  headsPerSlab: 0,
};

function computeRowSpacing(data: BatchFormData): number {
  const denominator = data.numberOfRows * data.rowLength;
  if (denominator <= 0) return 0;
  return Number((data.cultivationArea / denominator).toFixed(4));
}

// Pull the editable planting fields off a batch.
function batchToFormData(batch: BatchItem): BatchFormData {
  return {
    sourceGreenhouse: batch.greenhouseId ?? '',
    cropId: batch.cropId ?? '',
    varietyId: batch.varietyId ?? '',
    plantingDate: batch.plantingDate
      ? new Date(batch.plantingDate).toISOString().split('T')[0]
      : '',
    cultivationArea: batch.cultivationArea ?? 0,
    numberOfRows: batch.numberOfRows ?? 0,
    rowLength: batch.rowLength ?? 0,
    plantsPerMeter: batch.plantsPerMeter ?? 0,
    rowSpacing: batch.rowSpacing ?? 0,
    // 0 stands in for an unset bound; a null/absent range stays unconstrained.
    startRow: batch.startRow ?? 0,
    endRow: batch.endRow ?? 0,
    totalPlants: batch.totalPlants ?? 0,
    lostPlants: batch.lostPlants ?? 0,
    replicates: batch.replicates ?? 1,
    avgHeadsPerPlant: batch.avgHeadsPerPlant ?? 0,
    slabLength: batch.slabLength ?? 0,
    headsPerSlab: batch.headsPerSlab ?? 0,
  };
}

function validateEditForm(data: BatchFormData): BatchFormErrors {
  const errors: BatchFormErrors = {};
  if (!data.sourceGreenhouse.trim())
    errors.sourceGreenhouse = 'Greenhouse is required';
  if (!data.cropId) errors.cropId = 'Crop is required';
  if (!data.plantingDate) errors.plantingDate = 'Planting date is required';
  if (!data.cultivationArea || data.cultivationArea <= 0)
    errors.cultivationArea = 'Valid cultivation area is required';
  if (!data.numberOfRows || data.numberOfRows <= 0)
    errors.numberOfRows = 'Number of rows must be greater than 0';
  if (!data.rowLength || data.rowLength <= 0)
    errors.rowLength = 'Row length must be greater than 0';
  if (!data.plantsPerMeter || data.plantsPerMeter <= 0)
    errors.plantsPerMeter = 'Plants per meter must be greater than 0';
  if (!data.replicates || data.replicates < 1)
    errors.replicates = 'Replicates must be at least 1';
  validateRowRange(data, errors);
  return errors;
}

interface UseEditHarvestOptions {
  onSuccess?: () => void;
}

// Despite the name (kept for call-site stability) this edits the parent BATCH:
// the planting-level data now lives on the batches table. The yield input mode
// is per-HARVEST — it is toggled (and converted) from the harvest sidebar, so
// this hook carries no mode-switch machinery anymore.
export function useEditHarvest({ onSuccess }: UseEditHarvestOptions = {}) {
  const [formData, setFormData] = React.useState<BatchFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [batchId, setBatchId] = React.useState<string | null>(null);
  const [updateBatch, { loading }] = useUpdateBatchMutation();
  const tenantId = useTenantIdVariable();
  const { toast } = useToast();

  const populate = React.useCallback((batch: BatchItem) => {
    setBatchId(batch.id);
    setFormData(batchToFormData(batch));
    setErrors({});
  }, []);

  const reset = React.useCallback(() => {
    setBatchId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
  }, []);

  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const validationErrors = validateEditForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0 || !batchId) return;

      try {
        const rowSpacing = computeRowSpacing(formData);
        const ures = await updateBatch({
          variables: {
            id: batchId,
            input: {
              cropId: formData.cropId,
              varietyId: formData.varietyId || undefined,
              plantingDate: formData.plantingDate,
              cultivationArea: formData.cultivationArea,
              greenhouseId: formData.sourceGreenhouse.trim() || undefined,
              numberOfRows: formData.numberOfRows,
              rowLength: formData.rowLength,
              plantsPerMeter: formData.plantsPerMeter,
              rowSpacing,
              startRow: formData.startRow || undefined,
              endRow: formData.endRow || undefined,
              totalPlants: formData.totalPlants,
              lostPlants: formData.lostPlants,
              replicates: formData.replicates,
              // Tomato-only, never required: 0 means unset → persist null (so
              // clearing the field, or a non-tomato batch, stores null).
              avgHeadsPerPlant: formData.avgHeadsPerPlant || null,
              slabLength: formData.slabLength || null,
              headsPerSlab: formData.headsPerSlab || null,
              // inputMode/crate are per-harvest fields, managed from the
              // harvest sidebar. name/batchNumber are re-derived from
              // crop/variety by the backend.
            },
            tenantId,
          },
        });
        // The Apollo client uses errorPolicy: 'all', so a server-side failure
        // resolves (with errors) instead of rejecting. Surface it explicitly.
        if (ures.errors?.length) {
          throw new Error(ures.errors.map((e) => e.message).join('; '));
        }
        reset();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Failed to update batch:', err);
        toast({
          variant: 'destructive',
          title: 'Failed to update batch',
          description: message,
        });
      }
    },
    [formData, batchId, updateBatch, reset, onSuccess, tenantId, toast],
  );

  return {
    formData,
    setFormData,
    errors,
    loading,
    populate,
    reset,
    handleSubmit,
  };
}
