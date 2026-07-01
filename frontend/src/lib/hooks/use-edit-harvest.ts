'use client';

import * as React from 'react';
import {
  HarvestsDocument,
  InputMode,
  useConvertBatchInputModeMutation,
  useUpdateBatchMutation,
  type BatchesQuery,
  type HarvestsQuery,
} from '@/generated/graphql';
import type { BatchFormData, BatchFormErrors } from '@/types/batch.types';
import { validateRowRange } from '@/lib/hooks/use-create-batch-form';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { useToast } from '@/components/ui/toast-provider';

type BatchItem = BatchesQuery['batches'][number];
// A batch's harvests, as loaded on the harvest page. Only the fields the crate
// picker needs are used (id/date/timing + current crate).
export type EditBatchHarvest = HarvestsQuery['harvests'][number];

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
  inputMode: InputMode.Weight,
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
    inputMode: batch.inputMode ?? InputMode.Weight,
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
// the planting-level data now lives on the batches table.
export function useEditHarvest({ onSuccess }: UseEditHarvestOptions = {}) {
  const [formData, setFormData] = React.useState<BatchFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<BatchFormErrors>({});
  const [batchId, setBatchId] = React.useState<string | null>(null);
  // The batch's mode as loaded; compared against formData.inputMode to detect a
  // switch that needs a (batch-wide) entry conversion.
  const [originalInputMode, setOriginalInputMode] = React.useState<InputMode>(
    InputMode.Weight,
  );
  // The batch's harvests, so a weight -> crate switch can pick a crate for each.
  const [harvests, setHarvests] = React.useState<EditBatchHarvest[]>([]);
  // Crate chosen per harvest for a weight -> crate switch: crate mode derives kg
  // from a crate weight, so one must be picked for every harvest before the
  // conversion can run. Keyed by harvest id; only ids are sent (the backend
  // re-resolves the weight).
  const [crateByHarvest, setCrateByHarvest] = React.useState<
    Record<string, { id: string; weight: number }>
  >({});
  const [updateBatch, { loading }] = useUpdateBatchMutation();
  const [convertMode, { loading: converting }] =
    useConvertBatchInputModeMutation();
  const tenantId = useTenantIdVariable();
  const { toast } = useToast();

  const populate = React.useCallback(
    (batch: BatchItem, batchHarvests: EditBatchHarvest[] = []) => {
      setBatchId(batch.id);
      setFormData(batchToFormData(batch));
      setOriginalInputMode(batch.inputMode ?? InputMode.Weight);
      setHarvests(batchHarvests);
      // Seed each harvest with the crate it already carries (if any), so a
      // re-switch reuses it; weight-mode harvests start unset.
      setCrateByHarvest(
        Object.fromEntries(
          batchHarvests
            .filter((h) => h.crateId && h.crate)
            .map((h) => [
              h.id,
              { id: h.crateId as string, weight: h.crate!.weight },
            ]),
        ),
      );
      setErrors({});
    },
    [],
  );

  const reset = React.useCallback(() => {
    setBatchId(null);
    setFormData(EMPTY_FORM);
    setOriginalInputMode(InputMode.Weight);
    setHarvests([]);
    setCrateByHarvest({});
    setErrors({});
  }, []);

  const setCrateForHarvest = React.useCallback(
    (harvestId: string, id: string, weight: number) => {
      setCrateByHarvest((prev) => ({ ...prev, [harvestId]: { id, weight } }));
    },
    [],
  );

  // Switching a batch's input mode converts every harvest entry in the batch, so
  // it's a distinct, confirmed action layered on top of the plain metadata save.
  const modeChanged = formData.inputMode !== originalInputMode;
  const switchingToCrate = modeChanged && formData.inputMode === InputMode.Crate;
  // Crate mode can't be derived without a crate weight — block the switch until
  // every harvest has a crate chosen (mirrors the sidebar's crate-required gate).
  const needsCrate =
    switchingToCrate && harvests.some((h) => !crateByHarvest[h.id]);

  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const validationErrors = validateEditForm(formData);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0 || !batchId) return;
      // A crate-mode switch without a chosen crate can't be converted.
      if (needsCrate) return;

      try {
        // Flip the mode first (converts every harvest entry in the batch, in a
        // single server-side transaction) so the metadata update below sees and
        // returns the new mode. Skipped when the mode is unchanged.
        if (modeChanged) {
          // Weight -> crate carries one crate per harvest; crate -> weight needs
          // none (each harvest keeps its own crate weight).
          const crateAssignments = switchingToCrate
            ? harvests
                .filter((hv) => crateByHarvest[hv.id])
                .map((hv) => ({
                  harvestId: hv.id,
                  crateId: crateByHarvest[hv.id].id,
                }))
            : undefined;
          const res = await convertMode({
            variables: {
              batchId,
              targetMode: formData.inputMode,
              crateAssignments,
              tenantId,
            },
            refetchQueries: [{ query: HarvestsDocument }],
            awaitRefetchQueries: true,
          });
          // The Apollo client uses errorPolicy: 'all', so a server-side failure
          // resolves (with errors) instead of rejecting. Surface it explicitly —
          // otherwise a rolled-back conversion looks like a silent success.
          if (res.errors?.length) {
            throw new Error(res.errors.map((e) => e.message).join('; '));
          }
        }

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
              // inputMode is fixed at creation (the backend ignores it on
              // update). crateWeight is no longer a batch field — crate weight
              // is chosen per-harvest from the tenant's crates.
              // name/batchNumber are re-derived from crop/variety by the backend.
            },
            tenantId,
          },
        });
        if (ures.errors?.length) {
          throw new Error(ures.errors.map((e) => e.message).join('; '));
        }
        reset();
        onSuccess?.();
      } catch (err) {
        // Surface the failure instead of swallowing it: a rolled-back conversion
        // (e.g. a crate/validation error) otherwise looks like a silent no-op.
        const message = err instanceof Error ? err.message : String(err);
        console.error('Failed to update batch:', err);
        toast({
          variant: 'destructive',
          title: modeChanged
            ? 'Failed to switch input mode'
            : 'Failed to update batch',
          description: message,
        });
      }
    },
    [
      formData,
      batchId,
      needsCrate,
      modeChanged,
      switchingToCrate,
      harvests,
      crateByHarvest,
      convertMode,
      updateBatch,
      reset,
      onSuccess,
      tenantId,
      toast,
    ],
  );

  return {
    formData,
    setFormData,
    errors,
    loading: loading || converting,
    populate,
    reset,
    handleSubmit,
    // Input-mode switch state, consumed by the edit sidebar to render the
    // per-harvest crate pickers + confirmation and gate the save.
    modeChanged,
    switchingToCrate,
    needsCrate,
    harvests,
    crateByHarvest,
    setCrateForHarvest,
  };
}
