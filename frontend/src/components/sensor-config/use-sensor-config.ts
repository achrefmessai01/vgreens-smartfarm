'use client';

import {
  useDeleteSensorConfigMutation,
  useGetBucketDataQuery,
  useSensorConfigsQuery,
  useSensorDevicesQuery,
  useUpsertSensorConfigMutation,
  type SensorConfig,
} from '@/generated/graphql';
import {
  computeDefaultSensorPositions,
  type DefaultPosition,
} from '@/lib/sensor-default-positions';
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket';
import { useTenantGreenhouseLayouts } from '@/lib/hooks/use-tenant-greenhouse-layouts';
import * as React from 'react';

export interface SensorRow {
  device: string;
  config: SensorConfig | null;
  defaultPosition: DefaultPosition | null;
  /** Greenhouse the sensor is tagged with in InfluxDB (when no override). */
  defaultGreenhouse: string | null;
}

const INFLUX_LOOKUP_RANGE = '-30d';

export function useSensorConfig(tenantId: string) {
  const {
    data: configsData,
    loading: configsLoading,
    refetch,
  } = useSensorConfigsQuery({
    variables: { tenantId },
    skip: !tenantId,
  });

  const { data: devicesData, loading: devicesLoading } = useSensorDevicesQuery({
    variables: { tenantId },
    skip: !tenantId,
  });

  const greenhouseLayouts = useTenantGreenhouseLayouts(tenantId);

  // Pull last-per-series rows from InfluxDB once so we know which greenhouse
  // each device is currently tagged with. That gives us a sensible default
  // greenhouse + position for sensors with no override.
  const { bucketName } = useTenantBucketName(tenantId);
  const { data: bucketData } = useGetBucketDataQuery({
    variables: {
      input: {
        bucketName: bucketName ?? '',
        start: INFLUX_LOOKUP_RANGE,
        useLastPerSeries: true,
      },
    },
    skip: !bucketName,
    fetchPolicy: 'cache-first',
  });

  const deviceInfluxGreenhouse = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const row of bucketData?.getBucketData ?? []) {
      const data = row?.data as Record<string, unknown> | undefined;
      const device = typeof data?.device === 'string' ? data.device : '';
      const greenhouse =
        typeof data?.greenhouse === 'string'
          ? data.greenhouse
          : typeof data?.chamber === 'string'
            ? data.chamber
            : '';
      if (device && greenhouse && !map.has(device)) {
        map.set(device, greenhouse);
      }
    }
    return map;
  }, [bucketData?.getBucketData]);

  const [upsertConfig] = useUpsertSensorConfigMutation();
  const [deleteConfig] = useDeleteSensorConfigMutation();
  const [saving, setSaving] = React.useState(false);

  const configs = React.useMemo(
    () => configsData?.sensorConfigs ?? [],
    [configsData?.sensorConfigs],
  );
  const devices = React.useMemo(
    () => devicesData?.sensorDevices ?? [],
    [devicesData?.sensorDevices],
  );

  // Default positions: distribute devices across each greenhouse's bays.
  // The "greenhouse" key is taken from the override if set, otherwise from
  // the InfluxDB tag.
  const defaultPositions = React.useMemo(() => {
    const configMap = new Map(configs.map((c) => [c.device, c]));
    const allDevices = new Set([...devices, ...configs.map((c) => c.device)]);
    const deviceGreenhouse = new Map<string, string | undefined | null>();
    for (const device of allDevices) {
      const override = configMap.get(device)?.greenhouse;
      const influx = deviceInfluxGreenhouse.get(device);
      deviceGreenhouse.set(device, override ?? influx ?? null);
    }
    return computeDefaultSensorPositions(deviceGreenhouse, greenhouseLayouts);
  }, [configs, devices, deviceInfluxGreenhouse, greenhouseLayouts]);

  const rows: SensorRow[] = React.useMemo(() => {
    const configMap = new Map(configs.map((c) => [c.device, c]));
    const allDevices = new Set([...devices, ...configs.map((c) => c.device)]);
    return [...allDevices]
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      )
      .map((device) => ({
        device,
        config: configMap.get(device) ?? null,
        defaultPosition: defaultPositions.get(device) ?? null,
        defaultGreenhouse: deviceInfluxGreenhouse.get(device) ?? null,
      }));
  }, [configs, devices, defaultPositions, deviceInfluxGreenhouse]);

  const handleSave = React.useCallback(
    async (input: {
      device: string;
      xPosition?: number;
      yPosition?: number;
      greenhouse?: string;
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
