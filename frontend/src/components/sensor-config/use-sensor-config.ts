'use client';

import * as React from 'react';
import {
  useSensorConfigsQuery,
  useSensorDevicesQuery,
  useUpsertSensorConfigMutation,
  useDeleteSensorConfigMutation,
  type SensorConfig,
} from '@/generated/graphql';

export interface SensorRow {
  device: string;
  config: SensorConfig | null;
}

export function useSensorConfig(tenantId: string) {
  const { data: configsData, loading: configsLoading, refetch } =
    useSensorConfigsQuery({
      variables: { tenantId },
      skip: !tenantId,
    });

  const { data: devicesData, loading: devicesLoading } =
    useSensorDevicesQuery({
      variables: { tenantId },
      skip: !tenantId,
    });

  const [upsertConfig] = useUpsertSensorConfigMutation();
  const [deleteConfig] = useDeleteSensorConfigMutation();
  const [saving, setSaving] = React.useState(false);

  const configs = configsData?.sensorConfigs ?? [];
  const devices = devicesData?.sensorDevices ?? [];

  const rows: SensorRow[] = React.useMemo(() => {
    const configMap = new Map(configs.map((c) => [c.device, c]));
    const allDevices = new Set([
      ...devices,
      ...configs.map((c) => c.device),
    ]);
    return [...allDevices]
      .sort()
      .map((device) => ({ device, config: configMap.get(device) ?? null }));
  }, [configs, devices]);

  const handleSave = React.useCallback(
    async (input: {
      device: string;
      bay?: string;
      pole?: string;
      row?: string;
      greenhouse?: string;
      city?: string;
    }) => {
      setSaving(true);
      try {
        await upsertConfig({ variables: { input, tenantId } });
        await refetch();
      } finally {
        setSaving(false);
      }
    },
    [upsertConfig, tenantId, refetch],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        await deleteConfig({ variables: { id, tenantId } });
        await refetch();
      } finally {
        setSaving(false);
      }
    },
    [deleteConfig, tenantId, refetch],
  );

  return {
    rows,
    loading: configsLoading || devicesLoading,
    saving,
    handleSave,
    handleDelete,
  };
}
