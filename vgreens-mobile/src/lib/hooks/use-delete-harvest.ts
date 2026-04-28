import { useCallback } from 'react';
import { useDeleteHarvestMutation } from '@/generated/graphql';

interface DeleteOptions {
  skipSuccess?: boolean;
}

export function useDeleteHarvest(onSuccess?: () => void) {
  const [deleteHarvest, { loading }] = useDeleteHarvestMutation();

  const handleDelete = useCallback(
    async (id: string, options?: DeleteOptions) => {
      await deleteHarvest({ variables: { id } });
      if (!options?.skipSuccess) onSuccess?.();
    },
    [deleteHarvest, onSuccess],
  );

  return { handleDelete, loading };
}
