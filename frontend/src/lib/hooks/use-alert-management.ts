'use client';

import * as React from 'react';
import {
  type Alert,
  useAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
  useSoftDeleteAlertMutation,
  useResolveAlertMutation,
  useAcknowledgeAlertMutation,
} from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { toAlertsFilterVariables } from '@/lib/alerts-filter';

interface AlertFormData {
  sensorName: string;
  value: string;
  description?: string;
}

export function useAlertManagement(filter?: AlertsFilterInput | null) {
  const variables = React.useMemo(
    () => toAlertsFilterVariables(filter),
    [filter],
  );
  const { data, previousData, loading, refetch } = useAlertsQuery({
    variables: variables as { filter?: AlertsFilterInput },
    notifyOnNetworkStatusChange: true,
  });

  // `firstLoad` is true only while the very first request is in flight (no
  // data ever received yet). Subsequent refetches — caused by filter changes
  // or polling — keep the previous data on screen via Apollo's `previousData`,
  // so the consumer can render a smaller in-table loader instead of the
  // full-page skeleton it would otherwise show whenever `data?.alerts` is
  // briefly undefined.
  const hasEverLoaded = data !== undefined || previousData !== undefined;
  const firstLoad = loading && !hasEverLoaded;
  const [createAlert] = useCreateAlertMutation();
  const [updateAlert] = useUpdateAlertMutation();
  const [deleteAlert] = useDeleteAlertMutation();
  const [softDeleteAlert] = useSoftDeleteAlertMutation();
  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [resolveAlert] = useResolveAlertMutation();

  const [isLoading, setIsLoading] = React.useState(false);

  // Prefer fresh data; fall back to the previous result while a refetch is
  // in flight so the table doesn't flicker to empty + loading state.
  const alerts = ((data?.alerts ?? previousData?.alerts) || []) as Alert[];
  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  const handleCreate = async (formData: AlertFormData) => {
    setIsLoading(true);
    try {
      await createAlert({
        variables: {
          input: {
            sensorName: formData.sensorName,
            value: formData.value,
            description: formData.description,
          },
        },
      });
      refetch();
      return true;
    } catch (error) {
      console.error('Error creating alert:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, formData: AlertFormData) => {
    setIsLoading(true);
    try {
      await updateAlert({
        variables: {
          id,
          input: {
            sensorName: formData.sensorName,
            value: formData.value,
            description: formData.description,
          },
        },
      });
      refetch();
      return true;
    } catch (error) {
      console.error('Error updating alert:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (
    id: string,
  ): Promise<{ ok: true } | { ok: false; reason: string }> => {
    setIsLoading(true);
    try {
      await softDeleteAlert({ variables: { id } });
      refetch();
      return { ok: true };
    } catch (error) {
      console.error('Error soft-deleting alert:', error);
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleHardDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteAlert({ variables: { id } });
      refetch();
      return true;
    } catch (error) {
      console.error('Error hard-deleting alert:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    setIsLoading(true);
    try {
      await acknowledgeAlert({ variables: { id } });
      await refetch();
      return true;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    setIsLoading(true);
    try {
      await resolveAlert({ variables: { id } });
      await refetch();
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    alerts,
    loading,
    firstLoad,
    isLoading,
    openAlertsCount,
    handleCreate,
    handleUpdate,
    handleSoftDelete,
    handleHardDelete,
    handleAcknowledge,
    handleResolve,
    refetch,
  };
}
