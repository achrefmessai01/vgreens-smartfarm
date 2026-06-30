import {
  useGetHarvestBatchesQuery,
  type GetHarvestBatchesQuery,
} from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';

export type HarvestBatchListItem =
  GetHarvestBatchesQuery['harvestBatches'][number];

export function useHarvestBatches() {
  const tenantId = useTenantIdVariable();
  const { data, loading, error, refetch } = useGetHarvestBatchesQuery({
    variables: { tenantId },
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
