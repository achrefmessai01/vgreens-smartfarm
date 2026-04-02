'use client';

import * as React from 'react';
import {
  type Alert,
  useAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
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
  const { data, loading, refetch } = useAlertsQuery({
    variables: variables as { filter?: AlertsFilterInput },
  });
  const [createAlert] = useCreateAlertMutation();
  const [updateAlert] = useUpdateAlertMutation();
  const [deleteAlert] = useDeleteAlertMutation();
  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [resolveAlert] = useResolveAlertMutation();

  const [isLoading, setIsLoading] = React.useState(false);

  const alerts = (data?.alerts || []) as Alert[];
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

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteAlert({ variables: { id } });
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
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
