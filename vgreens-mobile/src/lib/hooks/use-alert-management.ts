import { useCallback, useMemo, useState } from 'react';
import {
  type Alert,
  AlertStatus,
  useAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
  useResolveAlertMutation,
  useAcknowledgeAlertMutation,
} from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { toAlertsFilterVariables } from '@/lib/alerts-filter';

export interface AlertFormData {
  sensorName: string;
  value: string;
  description?: string;
}

export function useAlertManagement(filter?: AlertsFilterInput | null) {
  const variables = useMemo(
    () => toAlertsFilterVariables(filter),
    [filter],
  );

  const { data, loading, error, refetch } = useAlertsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const [createAlert] = useCreateAlertMutation();
  const [updateAlert] = useUpdateAlertMutation();
  const [deleteAlert] = useDeleteAlertMutation();
  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [resolveAlert] = useResolveAlertMutation();

  const [isLoading, setIsLoading] = useState(false);

  const alerts = (data?.alerts ?? []) as Alert[];
  const openAlertsCount = alerts.filter((a) => a.status === AlertStatus.Open)
    .length;

  const handleCreate = useCallback(
    async (formData: AlertFormData) => {
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
        await refetch();
        return true;
      } catch (e) {
        console.error('Error creating alert:', e);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [createAlert, refetch],
  );

  const handleUpdate = useCallback(
    async (id: string, formData: AlertFormData) => {
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
        await refetch();
        return true;
      } catch (e) {
        console.error('Error updating alert:', e);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateAlert, refetch],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await deleteAlert({ variables: { id } });
        await refetch();
        return true;
      } catch (e) {
        console.error('Error deleting alert:', e);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteAlert, refetch],
  );

  const handleAcknowledge = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await acknowledgeAlert({ variables: { id } });
        await refetch();
        return true;
      } catch (e) {
        console.error('Error acknowledging alert:', e);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [acknowledgeAlert, refetch],
  );

  const handleResolve = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await resolveAlert({ variables: { id } });
        await refetch();
        return true;
      } catch (e) {
        console.error('Error resolving alert:', e);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [resolveAlert, refetch],
  );

  return {
    alerts,
    loading,
    error,
    isLoading,
    openAlertsCount,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAcknowledge,
    handleResolve,
    refetch,
  };
}
