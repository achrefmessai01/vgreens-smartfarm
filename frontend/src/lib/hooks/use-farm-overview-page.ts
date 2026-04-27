'use client';

import * as React from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { useSearchParams } from 'next/navigation';
import { formatFieldToLabel } from '@/lib/farm-data';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data';
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket';
import {
  useFarmConfigQuery,
  UserRole,
  useSensorConfigsQuery,
  useTenantsQuery,
  useUpsertSensorConfigMutation,
  type Tenant,
} from '@/generated/graphql';
import type { SensorConfigOverride } from '@/lib/farm-data-live';
import {
  DEFAULT_FARM_LAYOUT,
  type FarmLayoutConfig,
  type GreenhouseDimensions,
} from '@/lib/sensor-map-positions';
import type { FarmOverviewTranslations } from '@/types/farm-overview.types';
import type { ParameterType } from '@/types/farm.types';
import {
  ALLOWED_SINGLE_GREENHOUSE_PARAMETERS,
  PARAM_GREENHOUSE,
  PARAM_PARAMETER,
  PARAM_VIEW_MODE,
} from '@/lib/farm-overview-constants';
import {
  parseGreenhouseTab,
  parseParameter,
  parseViewMode,
  syncFarmOverviewStateToUrl,
} from '@/lib/farm-overview-utils';
import type { SensorPositionCommit } from '@/types/sensor-map';

export type { FarmOverviewTranslations } from '@/types/farm-overview.types';

export function useFarmOverviewPage(t: FarmOverviewTranslations) {
  const { toast } = useToast();
  const {
    role,
    user,
    loading: currentUserLoading,
    isTenantAdmin,
  } = useCurrentUser();
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  const canEditSensorPositions =
    role === UserRole.VgreensAdmin || isTenantAdmin;
  const searchParams = useSearchParams();
  const initialTenantIdFromUrl = searchParams.get('tenantId') ?? '';

  const { data: tenantsData } = useTenantsQuery({
    skip: !isVGreensAdmin,
    fetchPolicy: 'cache-first',
  });
  const tenants = React.useMemo(
    () => (tenantsData?.tenants || []) as Tenant[],
    [tenantsData?.tenants],
  );

  const [selectedTenantId, setSelectedTenantId] = React.useState<string>(
    initialTenantIdFromUrl,
  );

  React.useEffect(() => {
    if (!isVGreensAdmin || tenants.length === 0) return;
    if (
      initialTenantIdFromUrl &&
      tenants.some((tn) => tn.id === initialTenantIdFromUrl)
    ) {
      setSelectedTenantId(initialTenantIdFromUrl);
      return;
    }
    const valid =
      selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId);
    if (!valid) setSelectedTenantId(tenants[0].id);
  }, [isVGreensAdmin, tenants, selectedTenantId, initialTenantIdFromUrl]);

  const handleTenantChange = React.useCallback((tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (typeof window !== 'undefined' && tenantId) {
      const url = new URL(window.location.href);
      url.searchParams.set('tenantId', tenantId);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const { bucketName: selectedTenantBucketName, loading: tenantBucketLoading } =
    useTenantBucketName(isVGreensAdmin ? selectedTenantId : undefined);
  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined;

  // Explicit tenantId for all config queries.
  // Admin → selected tenant; tenant user → from me.tenant.id (always a valid UUID).
  const configQueryTenantId = isVGreensAdmin
    ? selectedTenantId
    : user?.tenant?.id || undefined;

  const { data: sensorConfigData, refetch: refetchSensorConfigs } =
    useSensorConfigsQuery({
      variables: { tenantId: configQueryTenantId },
      skip: !configQueryTenantId,
      fetchPolicy: 'cache-and-network',
    });

  const persistedSensorConfigMap = React.useMemo<
    Map<string, SensorConfigOverride>
  >(
    () =>
      new Map(
        (sensorConfigData?.sensorConfigs ?? []).map((c) => [
          c.device,
          {
            xPosition: c.xPosition ?? undefined,
            yPosition: c.yPosition ?? undefined,
            greenhouse: c.greenhouse ?? undefined,
            city: c.city ?? undefined,
          },
        ]),
      ),
    [sensorConfigData?.sensorConfigs],
  );

  const [upsertSensorConfig] = useUpsertSensorConfigMutation();
  const [optimisticPositionOverrides, setOptimisticPositionOverrides] =
    React.useState<Map<string, SensorConfigOverride>>(new Map());
  const [savingDeviceId, setSavingDeviceId] = React.useState<string | null>(
    null,
  );
  const [positionErrorDeviceId, setPositionErrorDeviceId] = React.useState<
    string | null
  >(null);

  const sensorConfigMap = React.useMemo<
    Map<string, SensorConfigOverride>
  >(() => {
    const merged = new Map(persistedSensorConfigMap);
    for (const [device, override] of optimisticPositionOverrides.entries()) {
      merged.set(device, {
        ...(merged.get(device) ?? {}),
        ...override,
      });
    }
    return merged;
  }, [optimisticPositionOverrides, persistedSensorConfigMap]);

  React.useEffect(() => {
    setOptimisticPositionOverrides((current) => {
      if (current.size === 0) return current;

      let didChange = false;
      const next = new Map(current);

      for (const [device, override] of current.entries()) {
        const persisted = persistedSensorConfigMap.get(device);
        if (
          persisted &&
          persisted.xPosition === override.xPosition &&
          persisted.yPosition === override.yPosition &&
          persisted.greenhouse === override.greenhouse
        ) {
          next.delete(device);
          didChange = true;
        }
      }

      return didChange ? next : current;
    });
  }, [persistedSensorConfigMap]);

  React.useEffect(() => {
    if (!positionErrorDeviceId) return;

    const timeoutId = window.setTimeout(() => {
      setPositionErrorDeviceId((current) =>
        current === positionErrorDeviceId ? null : current,
      );
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [positionErrorDeviceId]);

  const { data: farmConfigData } = useFarmConfigQuery({
    variables: { tenantId: configQueryTenantId },
    skip: !configQueryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const tenantGreenhouses = React.useMemo(() => {
    if (isVGreensAdmin) {
      const tenant = tenants.find((tn) => tn.id === selectedTenantId);
      return tenant?.greenhouses ?? [];
    }
    // For tenant users, greenhouses come from the `me` query (tenant relation).
    // The `tenant(id)` resolver is admin-only, so we use the already-loaded user.tenant.
    return user?.tenant?.greenhouses ?? [];
  }, [isVGreensAdmin, tenants, selectedTenantId, user?.tenant?.greenhouses]);

  const farmLayout = React.useMemo<FarmLayoutConfig>(
    () => ({
      bayCount:
        farmConfigData?.farmConfig?.bayCount ?? DEFAULT_FARM_LAYOUT.bayCount,
      polesMax:
        farmConfigData?.farmConfig?.polesMax ?? DEFAULT_FARM_LAYOUT.polesMax,
      chambersCount:
        farmConfigData?.farmConfig?.chambersCount ??
        DEFAULT_FARM_LAYOUT.chambersCount,
    }),
    [farmConfigData?.farmConfig],
  );

  const { bays, bucketFields, loading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
    sensorConfigs: sensorConfigMap,
    greenhouseLayouts: tenantGreenhouses,
  });

  const handleSensorPositionCommit = React.useCallback(
    async ({
      deviceId,
      greenhouse,
      xPosition,
      yPosition,
    }: SensorPositionCommit) => {
      if (!canEditSensorPositions) {
        throw new Error(
          'Current user is not allowed to update sensor positions',
        );
      }

      if (!configQueryTenantId) {
        throw new Error('Missing tenant context for sensor position update');
      }

      const nextX = Number(xPosition.toFixed(2));
      const nextY = Number(yPosition.toFixed(2));
      const persisted = persistedSensorConfigMap.get(deviceId);

      setSavingDeviceId(deviceId);
      setPositionErrorDeviceId(null);
      setOptimisticPositionOverrides((current) => {
        const next = new Map(current);
        next.set(deviceId, {
          ...(persisted ?? {}),
          xPosition: nextX,
          yPosition: nextY,
          greenhouse: greenhouse || persisted?.greenhouse,
        });
        return next;
      });

      try {
        await upsertSensorConfig({
          variables: {
            input: {
              device: deviceId,
              greenhouse: greenhouse || persisted?.greenhouse || undefined,
              xPosition: nextX,
              yPosition: nextY,
            },
            tenantId: configQueryTenantId,
          },
        });
        await refetchSensorConfigs();
      } catch (error) {
        setOptimisticPositionOverrides((current) => {
          const next = new Map(current);
          next.delete(deviceId);
          return next;
        });
        setPositionErrorDeviceId(deviceId);
        toast({
          title: t.positionSaveFailedTitle,
          description: t.positionSaveFailedDescription,
          variant: 'destructive',
        });
        throw error;
      } finally {
        setSavingDeviceId((current) => (current === deviceId ? null : current));
      }
    },
    [
      canEditSensorPositions,
      configQueryTenantId,
      persistedSensorConfigMap,
      refetchSensorConfigs,
      t.positionSaveFailedDescription,
      t.positionSaveFailedTitle,
      toast,
      upsertSensorConfig,
    ],
  );

  const tabFromUrl = parseGreenhouseTab(searchParams.get(PARAM_GREENHOUSE));
  const paramFromUrl = parseParameter(searchParams.get(PARAM_PARAMETER));
  const modeFromUrl = parseViewMode(searchParams.get(PARAM_VIEW_MODE));

  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>(paramFromUrl);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  );
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<
    'heatmap' | 'discrete' | 'graph'
  >(modeFromUrl);
  const [activeGreenhouseTab, setActiveGreenhouseTab] =
    React.useState(tabFromUrl);

  React.useEffect(() => {
    syncFarmOverviewStateToUrl(
      activeGreenhouseTab,
      selectedParameter,
      viewMode,
    );
  }, [activeGreenhouseTab, selectedParameter, viewMode]);

  const greenhouseOptions = React.useMemo(() => {
    const count =
      tenantGreenhouses.length > 0
        ? tenantGreenhouses.length
        : farmLayout.chambersCount;
    const ghLabels = [t.greenHouse1, t.greenHouse2];
    const options = [{ key: 'combined', label: t.combined }];
    for (let i = 0; i < count; i++) {
      options.push({
        key: `greenhouse_${i + 1}`,
        label:
          tenantGreenhouses[i]?.name || ghLabels[i] || `Greenhouse ${i + 1}`,
      });
    }
    return options;
  }, [t, farmLayout.chambersCount, tenantGreenhouses]);

  const parameterOptions = React.useMemo(() => {
    // Base options: all available fields
    let allOptions: { label: string; value: string }[];

    if (bucketFields.length === 0) {
      allOptions = [
        { label: t.temperature, value: 'temperature' },
        { label: t.humidity, value: 'humidity' },
        { label: t.co2, value: 'co2' },
        { label: t.soilEC, value: 'soil_ec' },
        { label: t.soilMoisture, value: 'soil_moisture' },
        { label: t.vpd, value: 'vpd' },
        { label: t.par, value: 'par' },
      ];
    } else {
      const hasPar = bucketFields.includes('par');
      const hasParEstimated = bucketFields.includes('par_estimated');
      const baseFields = bucketFields.filter(
        (f) => f !== 'lux' && f !== 'par' && f !== 'par_estimated',
      );
      allOptions = baseFields.map((field) => ({
        label: formatFieldToLabel(field),
        value: field,
      }));
      const parField: ParameterType | null = hasParEstimated
        ? 'par_estimated'
        : hasPar
          ? 'par'
          : null;
      if (parField) {
        allOptions.push({ label: formatFieldToLabel('par'), value: parField });
      }
    }

    // In combined view show all fields; in single greenhouse views, restrict to key climate sensors
    if (activeGreenhouseTab === 0) {
      return allOptions;
    }
    return allOptions.filter((opt) =>
      ALLOWED_SINGLE_GREENHOUSE_PARAMETERS.includes(opt.value as ParameterType),
    );
  }, [bucketFields, t, activeGreenhouseTab]);

  const effectiveParameter =
    selectedParameter && bucketFields.includes(selectedParameter)
      ? selectedParameter
      : (bucketFields[0] ?? 'temperature');

  React.useEffect(() => {
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0]);
    }
  }, [bucketFields, selectedParameter]);

  // Ensure selectedParameter is one of the visible options for the current tab
  React.useEffect(() => {
    const visibleKeys = new Set(parameterOptions.map((o) => o.value));
    if (!visibleKeys.has(selectedParameter)) {
      const fallback =
        (parameterOptions[0]?.value as ParameterType) ?? 'temperature';
      setSelectedParameter(fallback);
    }
  }, [parameterOptions, selectedParameter]);

  React.useEffect(() => {
    if (selectedSlotId) setHistoryDrawerOpen(true);
  }, [selectedSlotId]);

  React.useEffect(() => {
    const isParParameter =
      effectiveParameter === 'par' || effectiveParameter === 'par_estimated';
    if (isParParameter) {
      setViewMode((current) => (current === 'graph' ? current : 'graph'));
      return;
    }
    setViewMode((current) => (current === 'graph' ? 'discrete' : current));
  }, [effectiveParameter]);

  React.useEffect(() => {
    setSelectedSlotId(null);
    setHistoryDrawerOpen(false);
  }, [activeGreenhouseTab]);

  const selectedBays = React.useMemo(() => {
    if (activeGreenhouseTab === 0) return bays; // combined
    const bay = bays[activeGreenhouseTab - 1]; // 1-indexed → 0-indexed
    return bay ? [bay] : [];
  }, [activeGreenhouseTab, bays]);

  const greenhouseId = React.useMemo(() => 'greenhouse_01', []);

  const ghLabels = [t.greenHouse1, t.greenHouse2];

  const greenhouseLabel = React.useMemo(() => {
    const idx = activeGreenhouseTab - 1;
    return (
      tenantGreenhouses[idx]?.name ||
      ghLabels[idx] ||
      `Greenhouse ${activeGreenhouseTab}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGreenhouseTab, tenantGreenhouses, t.greenHouse1, t.greenHouse2]);

  const combinedGreenhouses = React.useMemo(() => {
    const count =
      tenantGreenhouses.length > 0
        ? tenantGreenhouses.length
        : farmLayout.chambersCount;
    return Array.from({ length: count }, (_, i) => ({
      key: bays[i]?.id ?? `greenhouse_${i + 1}`,
      label: tenantGreenhouses[i]?.name || ghLabels[i] || `Greenhouse ${i + 1}`,
      bay: bays[i] ?? null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bays,
    farmLayout.chambersCount,
    tenantGreenhouses,
    t.greenHouse1,
    t.greenHouse2,
  ]);

  const selectedGreenhouseDimensions =
    React.useMemo<GreenhouseDimensions | null>(() => {
      if (activeGreenhouseTab === 0 || tenantGreenhouses.length === 0)
        return null;
      const gh = tenantGreenhouses[activeGreenhouseTab - 1];
      if (!gh || gh.xDimension <= 0 || gh.yDimension <= 0) return null;
      return {
        xDimension: gh.xDimension,
        yDimension: gh.yDimension,
        doorPosition: gh.doorPosition ?? null,
        bayCount: gh.bayCount ?? null,
      };
    }, [tenantGreenhouses, activeGreenhouseTab]);

  const getParameterLabel = React.useCallback(
    (param: ParameterType) => formatFieldToLabel(param),
    [],
  );

  const tenantSelectorValue =
    selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId)
      ? selectedTenantId
      : (tenants[0]?.id ?? '');

  return {
    isVGreensAdmin,
    canEditSensorPositions,
    tenants,
    selectedTenantId,
    handleTenantChange,
    tenantSelectorValue,
    loading:
      loading ||
      currentUserLoading ||
      (isVGreensAdmin && !!selectedTenantId && tenantBucketLoading),
    greenhouseOptions,
    parameterOptions,
    effectiveParameter,
    setSelectedParameter,
    activeGreenhouseTab,
    setActiveGreenhouseTab,
    isCombinedView: activeGreenhouseTab === 0,
    viewMode,
    setViewMode,
    selectedSlotId,
    setSelectedSlotId,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    bays: selectedBays,
    greenhouseId,
    greenhouseLabel,
    combinedGreenhouses,
    getParameterLabel,
    handleSensorPositionCommit,
    savingDeviceId,
    positionErrorDeviceId,
    tenantBucketNameOverride,
    farmLayout,
    greenhouseDimensions: selectedGreenhouseDimensions,
    labels: {
      viewHeatmap: t.viewHeatmap,
      viewDiscrete: t.viewDiscrete,
      viewGraph: t.viewGraph,
      emptyForNow: t.emptyForNow ?? 'Empty for now',
      noSensor: t.noSensor,
      noData: t.noData,
      invalidDropTitle: t.invalidDropTitle,
      invalidDropDescription: t.invalidDropDescription,
      combined: t.combined,
      greenHouse1: t.greenHouse1,
      greenHouse2: t.greenHouse2,
    },
  };
}
