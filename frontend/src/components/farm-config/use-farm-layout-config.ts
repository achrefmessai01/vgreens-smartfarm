'use client';

import * as React from 'react';
import {
  type DoorPosition,
  MeDocument,
  TenantsDocument,
  useGreenhousesQuery,
  useCreateGreenhouseMutation,
  useUpdateGreenhouseMutation,
  useDeleteGreenhouseMutation,
} from '@/generated/graphql';

// One editable greenhouse row. `id` is present for rows that already exist in
// the greenhouses table; absent for freshly added rows. `key` is a stable
// client-side identity (the id for saved rows, a counter for new ones) so
// per-row expansion state and validation errors survive removals above.
export interface GreenhouseRowData {
  key: string;
  id?: string;
  name: string;
  xDimension: number;
  yDimension: number;
  doorPosition?: DoorPosition | null;
  bayCount?: number | null;
  isHorizontal?: boolean | null;
  hiddenInFarmOverview?: boolean | null;
}

/** Which of a row's fields failed validation on the last save attempt. */
export interface GreenhouseRowErrors {
  name?: boolean;
  dimensions?: boolean;
  bayCount?: boolean;
}

export type FarmLayoutSaveError = 'validation' | 'server' | null;

export function useFarmLayoutConfig(tenantId: string) {
  const { data, refetch } = useGreenhousesQuery({
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  // Farm Overview reads `user.tenant.greenhouses` from the Me query (and
  // admins read from Tenants) — refetch those alongside this hook's own
  // Greenhouses query so layout edits (including the Visible toggle) are
  // immediately reflected on Farm Overview without a page reload.
  const refetchQueries = React.useMemo(
    () => [{ query: MeDocument }, { query: TenantsDocument }],
    [],
  );
  const [createGreenhouse] = useCreateGreenhouseMutation({ refetchQueries });
  const [updateGreenhouse] = useUpdateGreenhouseMutation({ refetchQueries });
  const [deleteGreenhouse] = useDeleteGreenhouseMutation({ refetchQueries });
  const [saving, setSaving] = React.useState(false);
  const [rows, setRows] = React.useState<GreenhouseRowData[]>([]);
  // Ids of existing rows the user removed; deleted from the table on save.
  const [removedIds, setRemovedIds] = React.useState<string[]>([]);
  // Validation results of the last save attempt, keyed by row key.
  const [rowErrors, setRowErrors] = React.useState<
    Record<string, GreenhouseRowErrors>
  >({});
  const [saveError, setSaveError] = React.useState<FarmLayoutSaveError>(null);
  const newRowCounter = React.useRef(0);

  React.useEffect(() => {
    if (!data?.greenhouses) return;
    setRows(
      data.greenhouses.map((g) => ({
        key: g.id,
        id: g.id,
        name: g.name,
        xDimension: g.xDimension ?? 0,
        yDimension: g.yDimension ?? 0,
        doorPosition: g.doorPosition ?? null,
        bayCount: g.bayCount ?? null,
        isHorizontal: g.isHorizontal ?? false,
        hiddenInFarmOverview: g.hiddenInFarmOverview ?? false,
      })),
    );
    setRemovedIds([]);
    setRowErrors({});
  }, [data?.greenhouses]);

  const addRow = React.useCallback(
    () =>
      setRows((prev) => [
        ...prev,
        {
          key: `new-${newRowCounter.current++}`,
          name: '',
          xDimension: 0,
          yDimension: 0,
        },
      ]),
    [],
  );

  const updateRow = React.useCallback(
    (index: number, patch: Partial<GreenhouseRowData>) =>
      setRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      ),
    [],
  );

  const removeRow = React.useCallback(
    (index: number) =>
      setRows((prev) => {
        const row = prev[index];
        if (row?.id) setRemovedIds((ids) => [...ids, row.id as string]);
        return prev.filter((_, i) => i !== index);
      }),
    [],
  );

  // Triggered by the header Save button (plain onClick — the rows are not
  // wrapped in a <form> so each greenhouse card can host its own cycle form).
  // Returns the validation errors when the save was blocked by them, so the
  // caller can expand the offending cards; null means the save ran.
  const handleSubmit = async (): Promise<Record<
    string,
    GreenhouseRowErrors
  > | null> => {
    const errors: Record<string, GreenhouseRowErrors> = {};
    for (const r of rows) {
      const e: GreenhouseRowErrors = {};
      if (r.name.trim().length === 0) e.name = true;
      if (!(Number(r.xDimension) > 0) || !(Number(r.yDimension) > 0)) {
        e.dimensions = true;
      }
      if (
        r.bayCount != null &&
        (!Number.isInteger(Number(r.bayCount)) || Number(r.bayCount) < 1)
      ) {
        e.bayCount = true;
      }
      if (Object.keys(e).length > 0) errors[r.key] = e;
    }
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('validation');
      return errors;
    }

    setSaving(true);
    setSaveError(null);
    try {
      // Delete removed greenhouses, then upsert the rest against the table.
      await Promise.all(
        removedIds.map((id) =>
          deleteGreenhouse({ variables: { id, tenantId } }),
        ),
      );
      await Promise.all(
        rows.map((r) => {
          const input = {
            name: r.name.trim(),
            xDimension: Number(r.xDimension),
            yDimension: Number(r.yDimension),
            doorPosition: r.doorPosition ?? null,
            bayCount: r.bayCount ?? null,
            isHorizontal: r.isHorizontal ?? false,
            hiddenInFarmOverview: r.hiddenInFarmOverview ?? false,
          };
          if (r.id) {
            return updateGreenhouse({
              variables: { id: r.id, input, tenantId },
            });
          }
          return createGreenhouse({
            variables: { input: { ...input, tenantId } },
          });
        }),
      );
      await refetch();
    } catch (err) {
      console.error('Failed to save farm layout:', err);
      setSaveError('server');
    } finally {
      setSaving(false);
    }
    return null;
  };

  return {
    rows,
    saving,
    rowErrors,
    saveError,
    addRow,
    updateRow,
    removeRow,
    handleSubmit,
  };
}
