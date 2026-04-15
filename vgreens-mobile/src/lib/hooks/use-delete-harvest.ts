import { useCallback } from 'react';
import { useDeleteHarvestMutation } from '@/generated/graphql';

export function useDeleteHarvest(onSuccess?: () => void) {
  const [deleteHarvest, { loading }] = useDeleteHarvestMutation();

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteHarvest({ variables: { id } });
      onSuccess?.();
    },
    [deleteHarvest, onSuccess],
  );

  return { handleDelete, loading };
}
