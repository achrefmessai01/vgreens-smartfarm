'use client';

import * as React from 'react';
import { useDeleteBatchMutation } from '@/generated/graphql';

interface UseDeleteBatchOptions {
  onSuccess?: () => void;
}

// Soft-deletes a batch. The backend cascades the soft-delete to the batch's
// harvests, and both list queries exclude soft-deleted rows, so the batch and
// its entries simply disappear from the table after a refetch.
export function useDeleteBatch({ onSuccess }: UseDeleteBatchOptions = {}) {
  const [deleteBatch, { loading }] = useDeleteBatchMutation();

  const handleDeleteBatch = React.useCallback(
    async (id: string) => {
      try {
        await deleteBatch({ variables: { id } });
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete batch:', err);
      }
    },
    [deleteBatch, onSuccess],
  );

  return { handleDeleteBatch, loading };
}
