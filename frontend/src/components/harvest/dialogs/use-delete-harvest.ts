'use client';

import * as React from 'react';
import { useDeleteHarvestMutation } from '@/generated/graphql';

interface UseDeleteHarvestOptions {
  onSuccess?: () => void;
}

export function useDeleteHarvest({ onSuccess }: UseDeleteHarvestOptions = {}) {
  const [deleteHarvest, { loading }] = useDeleteHarvestMutation();

  const handleDelete = React.useCallback(
    async (id: string) => {
      try {
        await deleteHarvest({ variables: { id } });
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete harvest:', err);
      }
    },
    [deleteHarvest, onSuccess],
  );

  return { handleDelete, loading };
}
