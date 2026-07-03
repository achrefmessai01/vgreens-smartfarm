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
// the greenhouses table; absent for freshly added rows.
export interface GreenhouseRowData {
  id?: string;
  name: string;
  xDimension: number;
  yDimension: number;
  doorPosition?: DoorPosition | null;
  bayCount?: number | null;
  isHorizontal?: boolean | null;
  hiddenInFarmOverview?: boolean | null;
}

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

  React.useEffect(() => {
    if (!data?.greenhouses) return;
    setRows(
      data.greenhouses.map((g) => ({
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
  }, [data?.greenhouses]);

  const addRow = React.useCallback(
    () =>
      setRows((prev) => [...prev, { name: '', xDimension: 0, yDimension: 0 }]),
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
  const handleSubmit = async () => {
    const cleaned = rows
      .map((r) => ({
        id: r.id,
        name: r.name.trim(),
        xDimension: Number(r.xDimension),
        yDimension: Number(r.yDimension),
        doorPosition: r.doorPosition ?? null,
        bayCount: r.bayCount ?? null,
        isHorizontal: r.isHorizontal ?? false,
        hiddenInFarmOverview: r.hiddenInFarmOverview ?? false,
      }))
      .filter((r) => r.name.length > 0);
    if (cleaned.some((r) => r.xDimension <= 0 || r.yDimension <= 0)) return;

    setSaving(true);
    try {
      // Delete removed greenhouses, then upsert the rest against the table.
      await Promise.all(
        removedIds.map((id) =>
          deleteGreenhouse({ variables: { id, tenantId } }),
        ),
      );
      await Promise.all(
        cleaned.map((r) => {
          const input = {
            name: r.name,
            xDimension: r.xDimension,
            yDimension: r.yDimension,
            doorPosition: r.doorPosition,
            bayCount: r.bayCount,
            isHorizontal: r.isHorizontal,
            hiddenInFarmOverview: r.hiddenInFarmOverview,
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
    } finally {
      setSaving(false);
    }
  };

  return { rows, saving, addRow, updateRow, removeRow, handleSubmit };
}
