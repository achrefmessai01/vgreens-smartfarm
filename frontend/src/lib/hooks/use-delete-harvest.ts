'use client';

import * as React from 'react';
import { useDeleteHarvestMutation } from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';

interface UseDeleteHarvestOptions {
  onSuccess?: () => void;
}

interface DeleteHarvestOptions {
  skipSuccess?: boolean;
}

export function useDeleteHarvest({ onSuccess }: UseDeleteHarvestOptions = {}) {
  const [deleteHarvest, { loading }] = useDeleteHarvestMutation();
  const tenantId = useTenantIdVariable();

  const handleDelete = React.useCallback(
    async (id: string, options?: DeleteHarvestOptions) => {
      try {
        await deleteHarvest({ variables: { id, tenantId } });
        if (!options?.skipSuccess) onSuccess?.();
      } catch (err) {
        console.error('Failed to delete harvest:', err);
      }
    },
    [deleteHarvest, onSuccess, tenantId],
  );

  return { handleDelete, loading };
}
