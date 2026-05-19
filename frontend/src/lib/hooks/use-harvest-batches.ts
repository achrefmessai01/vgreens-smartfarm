import {
  useGetHarvestBatchesQuery,
  type GetHarvestBatchesQuery,
} from '@/generated/graphql';

export type HarvestBatchListItem =
  GetHarvestBatchesQuery['harvestBatches'][number];

export function useHarvestBatches() {
  const { data, loading, error, refetch } = useGetHarvestBatchesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  return {
    batches: data?.harvestBatches ?? [],
    loading,
    error,
    refetch: () => refetch(),
  };
}
