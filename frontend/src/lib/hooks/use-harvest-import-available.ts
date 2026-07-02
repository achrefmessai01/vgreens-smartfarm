'use client';

import { useQuery } from '@apollo/client';
import { useCurrentUser } from './use-current-user';
import { HARVEST_IMPORT_AVAILABLE_QUERY } from '@/graphql/queries/harvest.queries';

// returns null while loading, true/false once settled
export function useHarvestImportAvailable(): boolean | null {
  const { isVGreensAdmin, isTenantAdmin, loading: userLoading } = useCurrentUser();

  // skip for roles that can never import
  const skip = userLoading || (!isVGreensAdmin && !isTenantAdmin);

  const { data, loading } = useQuery<{ harvestImportAvailable: boolean }>(
    HARVEST_IMPORT_AVAILABLE_QUERY,
    { skip, fetchPolicy: 'cache-and-network' },
  );

  if (userLoading || (loading && !data)) return null;
  if (skip) return false;
  return data?.harvestImportAvailable ?? false;
}
