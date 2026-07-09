'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import {
  DELETED_BATCHES_QUERY,
  DELETED_HARVESTS_QUERY,
} from '@/graphql/queries/admin-history.queries';
import {
  RESTORE_BATCH_MUTATION,
  RESTORE_HARVEST_MUTATION,
} from '@/graphql/mutations/admin-history.mutations';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';

export function useAdminHistory() {
  const tenantId = useTenantIdVariable();
  const { toast } = useToast();
  const { t } = useI18n();
  const h = t.pages.admin.history;

  const { data: deletedBatchesData, loading: batchesLoading, refetch: refetchBatches } =
    useQuery(DELETED_BATCHES_QUERY, {
      variables: { tenantId },
      fetchPolicy: 'network-only',
      skip: !tenantId,
    });

  const { data: deletedHarvestsData, loading: harvestsLoading, refetch: refetchHarvests } =
    useQuery(DELETED_HARVESTS_QUERY, {
      variables: { tenantId },
      fetchPolicy: 'network-only',
      skip: !tenantId,
    });

  const [restoreBatchMutation, { loading: restoringBatch }] = useMutation(RESTORE_BATCH_MUTATION);
  const [restoreHarvestMutation, { loading: restoringHarvest }] = useMutation(RESTORE_HARVEST_MUTATION);

  const restoreBatch = React.useCallback(
    async (id: string) => {
      if (!tenantId) return;
      try {
        await restoreBatchMutation({ variables: { id, tenantId } });
        toast({ title: h.batchRestored });
        await refetchBatches();
      } catch (err) {
        toast({ variant: 'destructive', title: h.restoreBatchFailed, description: String(err) });
      }
    },
    [tenantId, restoreBatchMutation, refetchBatches, toast, h],
  );

  const restoreHarvest = React.useCallback(
    async (id: string) => {
      if (!tenantId) return;
      try {
        await restoreHarvestMutation({ variables: { id, tenantId } });
        toast({ title: h.harvestRestored });
        await refetchHarvests();
      } catch (err) {
        toast({ variant: 'destructive', title: h.restoreHarvestFailed, description: String(err) });
      }
    },
    [tenantId, restoreHarvestMutation, refetchHarvests, toast, h],
  );

  return {
    tenantId,
    deletedBatches: deletedBatchesData?.deletedBatches ?? [],
    deletedHarvests: deletedHarvestsData?.deletedHarvests ?? [],
    batchesLoading,
    harvestsLoading,
    restoringBatch,
    restoringHarvest,
    restoreBatch,
    restoreHarvest,
  };
}
