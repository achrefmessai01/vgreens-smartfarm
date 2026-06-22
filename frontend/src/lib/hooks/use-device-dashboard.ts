'use client';

import * as React from 'react';
import {
  DeviceStatusRange,
  useDeviceActivitySeriesQuery,
  useDeviceStatusesQuery,
  useTenantFeaturesQuery,
  useTenantsQuery,
  type DeviceStatus,
} from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  STATE_ORDER,
  stateSortRank,
} from '@/components/devices/device-status-constants';

const DEVICE_STATUS_FEATURE_KEY = 'device_status';

/**
 * Group key derived from a device name: the leading token before the first
 * digit/separator. e.g. `Air_03` → `Air`, `Soil-08` → `Soil`,
 * `vgreens-v1-09` → `vgreens`. Lets us offer a dynamic "device group" filter
 * (air / soil / edge …) without hard-coding the families.
 */
export function deviceGroup(device: string): string {
  const match = device.match(/^[^\d_\-\s.]+/);
  return match ? match[0] : device;
}

export interface CustomRange {
  from: Date;
  to: Date;
}

export interface DeviceDashboardData {
  range: DeviceStatusRange;
  setRange: (range: DeviceStatusRange) => void;

  /** Active custom from/to range (overrides the preset), or null for presets. */
  customRange: CustomRange | null;
  setCustomRange: (range: CustomRange | null) => void;

  /**
   * Devices for the active group filter, sorted worst-first (never-seen →
   * working), then by name.
   */
  devices: DeviceStatus[];
  /** Count of devices per state (for the current group filter). */
  statusCounts: Record<string, number>;
  totalDevices: number;
  totalRealDataPoints: number;
  activitySeries: { time: string; count: number }[];

  /** Distinct device groups derived from device names (e.g. Air, Soil, vgreens). */
  deviceGroups: string[];
  /** Active group filter (`''` = all groups). */
  groupFilter: string;
  setGroupFilter: (group: string) => void;

  // vGreens-admin tenant picker (empty for tenant admins).
  isVGreensAdmin: boolean;
  tenants: { id: string; name: string }[];
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;

  /**
   * Whether `device_status` is enabled for the active tenant. Tenant admins are
   * already gated by the page-level FeatureGuard (always `true` here); for
   * vGreens admins this reflects the tenant chosen in the picker.
   */
  featureEnabled: boolean;
  /** True once the per-tenant feature check has resolved (avoids a flash). */
  featureChecked: boolean;

  /** Auto-refresh interval in ms (`0` = off). */
  refreshIntervalMs: number;
  setRefreshIntervalMs: (ms: number) => void;
  /** Manually refetch the device data now. */
  refetch: () => void;

  loading: boolean;
  error?: Error;
}

export function useDeviceDashboard(): DeviceDashboardData {
  const { isVGreensAdmin } = useCurrentUser();
  const [range, setRangeState] = React.useState<DeviceStatusRange>(
    DeviceStatusRange.SevenDays,
  );
  const [customRange, setCustomRange] = React.useState<CustomRange | null>(
    null,
  );
  const [selectedTenantId, setSelectedTenantId] = React.useState('');

  // Selecting a preset clears any custom range and vice-versa.
  const setRange = React.useCallback((r: DeviceStatusRange) => {
    setCustomRange(null);
    setRangeState(r);
  }, []);

  // Only vGreens admins need the tenant list (to scope the InfluxDB bucket).
  const { data: tenantsData } = useTenantsQuery({ skip: !isVGreensAdmin });
  const tenants = React.useMemo(
    () => (tenantsData?.tenants ?? []).map((t) => ({ id: t.id, name: t.name })),
    [tenantsData],
  );

  // Default the admin picker to the first tenant once loaded.
  React.useEffect(() => {
    if (isVGreensAdmin && !selectedTenantId && tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [isVGreensAdmin, selectedTenantId, tenants]);

  const tenantId = isVGreensAdmin ? selectedTenantId || undefined : undefined;
  const skip = isVGreensAdmin && !selectedTenantId;
  const input = customRange
    ? {
        start: customRange.from.toISOString(),
        stop: customRange.to.toISOString(),
        tenantId,
      }
    : { range, tenantId };

  // Per-tenant feature gate. Tenant admins were already gated by the page-level
  // FeatureGuard, so they don't need this; vGreens admins must check the tenant
  // they picked, since FeatureGuard bypasses them.
  const featuresQuery = useTenantFeaturesQuery({
    variables: { tenantId },
    skip: !isVGreensAdmin || !selectedTenantId,
    fetchPolicy: 'cache-and-network',
  });
  const featureEnabled = !isVGreensAdmin
    ? true
    : (featuresQuery.data?.tenantFeatures ?? []).some(
        (tf) =>
          tf.enabled &&
          tf.feature?.isActive &&
          tf.feature?.key === DEVICE_STATUS_FEATURE_KEY,
      );
  const featureChecked =
    !isVGreensAdmin || (!!selectedTenantId && featuresQuery.data !== undefined);

  // Don't fetch device data for a tenant that doesn't have the feature on.
  const dataSkip = skip || (isVGreensAdmin && !featureEnabled);

  const [refreshIntervalMs, setRefreshIntervalMs] = React.useState(0);
  const pollInterval = refreshIntervalMs > 0 ? refreshIntervalMs : undefined;

  const statusesQuery = useDeviceStatusesQuery({
    variables: { input },
    skip: dataSkip,
    fetchPolicy: 'cache-and-network',
    pollInterval,
  });
  const activityQuery = useDeviceActivitySeriesQuery({
    variables: { input },
    skip: dataSkip,
    fetchPolicy: 'cache-and-network',
    pollInterval,
  });

  const refetch = React.useCallback(() => {
    void statusesQuery.refetch();
    void activityQuery.refetch();
  }, [statusesQuery, activityQuery]);

  const [groupFilter, setGroupFilter] = React.useState('');

  const allDevices = React.useMemo(() => {
    const list = [...(statusesQuery.data?.deviceStatuses ?? [])];
    list.sort((a, b) => {
      const r = stateSortRank(a.state) - stateSortRank(b.state);
      return r !== 0 ? r : a.device.localeCompare(b.device);
    });
    return list;
  }, [statusesQuery.data]);

  const deviceGroups = React.useMemo(() => {
    const groups = new Set(allDevices.map((d) => deviceGroup(d.device)));
    return [...groups].sort((a, b) => a.localeCompare(b));
  }, [allDevices]);

  // Drop a stale group filter when the device set no longer contains it
  // (e.g. after switching tenant or range).
  React.useEffect(() => {
    if (groupFilter && !deviceGroups.includes(groupFilter)) {
      setGroupFilter('');
    }
  }, [groupFilter, deviceGroups]);

  const devices = React.useMemo(
    () =>
      groupFilter
        ? allDevices.filter((d) => deviceGroup(d.device) === groupFilter)
        : allDevices,
    [allDevices, groupFilter],
  );

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATE_ORDER) counts[s] = 0;
    for (const d of devices) counts[d.state] = (counts[d.state] ?? 0) + 1;
    return counts;
  }, [devices]);

  const totalRealDataPoints = React.useMemo(
    () => devices.reduce((sum, d) => sum + (d.realDataPoints ?? 0), 0),
    [devices],
  );

  const activitySeries = React.useMemo(
    () =>
      (activityQuery.data?.deviceActivitySeries ?? []).map((p) => ({
        time: p.time as string,
        count: p.count,
      })),
    [activityQuery.data],
  );

  return {
    range,
    setRange,
    customRange,
    setCustomRange,
    devices,
    statusCounts,
    totalDevices: devices.length,
    totalRealDataPoints,
    activitySeries,
    deviceGroups,
    groupFilter,
    setGroupFilter,
    isVGreensAdmin,
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    featureEnabled,
    featureChecked,
    refreshIntervalMs,
    setRefreshIntervalMs,
    refetch,
    loading: statusesQuery.loading || activityQuery.loading,
    error: statusesQuery.error ?? activityQuery.error,
  };
}

/** Hours since a timestamp, or null when never seen. */
export function hoursSince(
  iso?: string | null,
  now = Date.now(),
): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, (now - t) / 3_600_000);
}
