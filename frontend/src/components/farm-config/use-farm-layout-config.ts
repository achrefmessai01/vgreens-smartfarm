'use client';

import * as React from 'react';
import {
  type GreenhouseInput,
  useTenantQuery,
  useUpdateTenantMutation,
} from '@/generated/graphql';

export function useFarmLayoutConfig(tenantId: string) {
  const { data, refetch } = useTenantQuery({
    variables: { id: tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  const [updateTenant] = useUpdateTenantMutation();
  const [saving, setSaving] = React.useState(false);
  const [rows, setRows] = React.useState<GreenhouseInput[]>([]);

  React.useEffect(() => {
    if (!data?.tenant) return;
    setRows(data.tenant.greenhouses ?? []);
  }, [data?.tenant]);

  const addRow = React.useCallback(
    () =>
      setRows((prev) => [...prev, { name: '', xDimension: 0, yDimension: 0 }]),
    [],
  );

  const updateRow = React.useCallback(
    (index: number, patch: Partial<GreenhouseInput>) =>
      setRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      ),
    [],
  );

  const removeRow = React.useCallback(
    (index: number) => setRows((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = rows
      .map((r) => ({
        name: r.name.trim(),
        xDimension: Number(r.xDimension),
        yDimension: Number(r.yDimension),
      }))
      .filter((r) => r.name.length > 0);
    if (payload.some((r) => r.xDimension <= 0 || r.yDimension <= 0)) return;
    setSaving(true);
    try {
      await updateTenant({
        variables: { id: tenantId, input: { greenhouses: payload } },
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return { rows, saving, addRow, updateRow, removeRow, handleSubmit };
}
