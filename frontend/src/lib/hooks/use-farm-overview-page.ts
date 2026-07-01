'use client';

import * as React from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { useSearchParams } from 'next/navigation';
import { formatFieldToLabel } from '@/lib/farm-data';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data';
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket';
import {
  useSelectedTenantId,
  useSetSelectedTenantId,
} from '@/lib/contexts/selected-tenant-context';
import {
  useFarmConfigQuery,
  UserRole,
  useGreenhousesQuery,
  useSensorConfigsQuery,
  useSetTenantDisabledSensorFieldsMutation,
  useTenantsQuery,
  useUpsertSensorConfigMutation,
  type Tenant,
} from '@/generated/graphql';
import {
  createEmptyBay,
  resolveSensorPosition,
  type OverviewConfiguredSensor,
  type SensorConfigOverride,
} from '@/lib/farm-data-live';
import {
  computeDefaultSensorPositions,
  type GreenhouseLayout,
} from '@/lib/sensor-default-positions';
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
  SENSOR_OVERVIEW_FIELD,
  SENSOR_OVERVIEW_PARAMETER,
  type ViewMode,
} from '@/lib/farm-overview-constants';
import {
  findBayForGreenhouse,
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

  // Tenant selection is owned by the global SelectedTenantProvider (navbar
  // dropdown + URL/localStorage persistence). This page reads it and falls
  // back to the first tenant only when nothing is selected yet, to preserve
  // the previous "always have a tenant in scope" UX for admins.
  const globalSelectedTenantId = useSelectedTenantId();
  const setGlobalSelectedTenantId = useSetSelectedTenantId();
  const selectedTenantId =
    globalSelectedTenantId ?? initialTenantIdFromUrl ?? '';

  React.useEffect(() => {
    if (!isVGreensAdmin || tenants.length === 0) return;
    // If the global selection is empty (cross-tenant view) or stale, default
    // to the first tenant so the farm overview always has a concrete tenant
    // to render — cross-tenant aggregation isn't meaningful for this view.
    const isValid =
      selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId);
    if (!isValid) {
      setGlobalSelectedTenantId(tenants[0].id);
    }
  }, [
    isVGreensAdmin,
    tenants,
    selectedTenantId,
    setGlobalSelectedTenantId,
  ]);

  const handleTenantChange = React.useCallback(
    (tenantId: string) => {
      setGlobalSelectedTenantId(tenantId || null);
    },
    [setGlobalSelectedTenantId],
  );

  const { bucketName: selectedTenantBucketName, loading: tenantBucketLoading } =
    useTenantBucketName(isVGreensAdmin ? selectedTenantId : undefined);
  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined;
  // Mirror the bucket override but for tenantId — forwarded to the PAR
  // graph so admins viewing another tenant fetch its mapping. `undefined`
  // for tenant users lets the backend resolve from their auth context.
  const tenantIdOverride = isVGreensAdmin
    ? selectedTenantId || null
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
            hiddenInFarmOverview: c.hiddenInFarmOverview ?? undefined,
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

  // Resolve a greenhouse name -> id so a position commit can persist the
  // sensor's greenhouseId (the FK). Sourced from the greenhouses table.
  const { data: greenhousesData } = useGreenhousesQuery({
    variables: { tenantId: configQueryTenantId },
    skip: !configQueryTenantId,
    fetchPolicy: 'cache-and-network',
  });
  const greenhouseIdByName = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const g of greenhousesData?.greenhouses ?? []) map.set(g.name, g.id);
    return map;
  }, [greenhousesData?.greenhouses]);

  const tenantGreenhouses = React.useMemo(() => {
    // Source of truth: admin → selected tenant; tenant user → own tenant from `me`.
    const all = isVGreensAdmin
      ? (tenants.find((tn) => tn.id === selectedTenantId)?.greenhouses ?? [])
      : (user?.tenant?.greenhouses ?? []);
    // Hide greenhouses the operator has toggled off in Farm Layout config —
    // they remain configured but disappear from the overview tabs and grid.
    return all.filter((g) => g.hiddenInFarmOverview !== true);
  }, [isVGreensAdmin, tenants, selectedTenantId, user?.tenant?.greenhouses]);

  const tenantDisabledSensorFields = React.useMemo<string[]>(() => {
    if (isVGreensAdmin) {
      const tenant = tenants.find((tn) => tn.id === selectedTenantId);
      return tenant?.disabledSensorFields ?? [];
    }
    return user?.tenant?.disabledSensorFields ?? [];
  }, [
    isVGreensAdmin,
    tenants,
    selectedTenantId,
    user?.tenant?.disabledSensorFields,
  ]);

  const disabledSensorFieldsSet = React.useMemo(
    () => new Set(tenantDisabledSensorFields),
    [tenantDisabledSensorFields],
  );

  // The Sensor Overview map tab is shown unless toggled off in the "Enable
  // Sensors" dropdown (persisted via the sentinel field in disabledSensorFields).
  const overviewEnabled = !disabledSensorFieldsSet.has(SENSOR_OVERVIEW_FIELD);

  const [setDisabledSensorFieldsMutation] =
    useSetTenantDisabledSensorFieldsMutation();
  const [savingSensorFields, setSavingSensorFields] = React.useState(false);

  const handleToggleSensorField = React.useCallback(
    async (fields: string[], enabled: boolean) => {
      if (!canEditSensorPositions) return;
      const next = new Set(tenantDisabledSensorFields);
      for (const field of fields) {
        if (enabled) {
          next.delete(field);
        } else {
          next.add(field);
        }
      }
      setSavingSensorFields(true);
      try {
        await setDisabledSensorFieldsMutation({
          variables: {
            fields: Array.from(next),
            tenantId: configQueryTenantId ?? undefined,
          },
          // Update the cached tenant so the UI reflects the change without a
          // full refetch of `me` / `tenants`.
          update: (cache, result) => {
            const updated = result.data?.setTenantDisabledSensorFields;
            if (!updated) return;
            cache.modify({
              id: cache.identify({ __typename: 'Tenant', id: updated.id }),
              fields: {
                disabledSensorFields: () => updated.disabledSensorFields,
              },
            });
          },
        });
      } catch (err) {
        toast({
          title: t.positionSaveFailedTitle,
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      } finally {
        setSavingSensorFields(false);
      }
    },
    [
      canEditSensorPositions,
      configQueryTenantId,
      setDisabledSensorFieldsMutation,
      t.positionSaveFailedTitle,
      tenantDisabledSensorFields,
      toast,
    ],
  );

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
          // A drag never moves a sensor to another greenhouse (the canvas is
          // per-greenhouse), so keep the persisted RAW greenhouse name. The
          // `greenhouse` from the drag payload is derived from the slot id,
          // whose whitespace is normalized to `_` — using it here would break
          // the `cfg.greenhouse === gh.name` overview filter (and never
          // reconcile) for greenhouses whose names contain spaces.
          greenhouse: persisted?.greenhouse ?? greenhouse,
        });
        return next;
      });

      const greenhouseId =
        (greenhouse ? greenhouseIdByName.get(greenhouse) : undefined) ??
        (persisted?.greenhouse
          ? greenhouseIdByName.get(persisted.greenhouse)
          : undefined);

      try {
        await upsertSensorConfig({
          variables: {
            input: {
              device: deviceId,
              greenhouseId: greenhouseId || undefined,
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
      greenhouseIdByName,
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
  const [viewMode, setViewMode] = React.useState<ViewMode>(modeFromUrl);
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
        // VSL-169: Soil EC / Soil moisture hidden from the fallback option
        // list (used when the bucket has no fields yet).
        // { label: t.soilEC, value: 'soil_ec' },
        // { label: t.soilMoisture, value: 'soil_moisture' },
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

    // Restrict to the four key climate sensors (Humidity / Temperature / VPD /
    // PAR) in every view. The Combined view previously surfaced every bucket
    // field — including diagnostic ones like Battery, RSSI, Missing — which
    // cluttered the per-greenhouse summary cards.
    const allowed = allOptions.filter((opt) =>
      ALLOWED_SINGLE_GREENHOUSE_PARAMETERS.includes(opt.value as ParameterType),
    );
    // Hide types the tenant has explicitly disabled. Some logical types map
    // to multiple Influx field names (PAR/PAR estimated, Soil EC/conductivity)
    // — disabling any alias hides the option regardless of which name a
    // tenant's bucket emits.
    const aliasGroups: string[][] = [
      ['par', 'par_estimated'],
      // VSL-169: Soil EC aliases kept commented for re-enablement alongside
      // the constants in farm-overview-constants.ts.
      // ['soil_ec', 'soil_conductivity'],
    ];
    return allowed.filter((opt) => {
      const group = aliasGroups.find((g) => g.includes(opt.value));
      if (group) {
        return !group.some((alias) => disabledSensorFieldsSet.has(alias));
      }
      return !disabledSensorFieldsSet.has(opt.value);
    });
  }, [bucketFields, t, disabledSensorFieldsSet]);

  // `overview` is a pseudo-parameter (the all-sensors map), not a bucket field,
  // so it is exempt from the bucket-field checks below.
  const isOverviewParameter = selectedParameter === SENSOR_OVERVIEW_PARAMETER;

  const effectiveParameter =
    isOverviewParameter && overviewEnabled
      ? SENSOR_OVERVIEW_PARAMETER
      : selectedParameter && bucketFields.includes(selectedParameter)
        ? selectedParameter
        : (bucketFields[0] ?? 'temperature');

  React.useEffect(() => {
    if (selectedParameter === SENSOR_OVERVIEW_PARAMETER) return;
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0]);
    }
  }, [bucketFields, selectedParameter]);

  // Ensure selectedParameter is one of the visible options for the current tab
  React.useEffect(() => {
    const visibleKeys = new Set(parameterOptions.map((o) => o.value));
    if (overviewEnabled) visibleKeys.add(SENSOR_OVERVIEW_PARAMETER);
    if (!visibleKeys.has(selectedParameter)) {
      const fallback =
        (parameterOptions[0]?.value as ParameterType) ?? 'temperature';
      setSelectedParameter(fallback);
    }
  }, [parameterOptions, selectedParameter, overviewEnabled]);

  React.useEffect(() => {
    if (selectedSlotId) setHistoryDrawerOpen(true);
  }, [selectedSlotId]);

  React.useEffect(() => {
    // The Sensor Overview map has no heatmap/discrete/graph sub-mode, so leave
    // the view mode untouched while it's selected.
    if (effectiveParameter === SENSOR_OVERVIEW_PARAMETER) return;
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

  // If the visible-greenhouse list shrinks (e.g. operator just hid this one),
  // fall back to the Combined tab so we never point at a missing greenhouse.
  React.useEffect(() => {
    if (
      activeGreenhouseTab > 0 &&
      activeGreenhouseTab > tenantGreenhouses.length
    ) {
      setActiveGreenhouseTab(0);
    }
  }, [activeGreenhouseTab, tenantGreenhouses.length]);

  // Every sensor CONFIGURED for the selected greenhouse, with a resolved map
  // position — including ones that currently send no data (so the Sensor
  // Overview map can show the full installed fleet, not just live devices).
  // Unpositioned sensors get the same greenhouse-layout fallback used for live
  // sensors. Only meaningful for a specific greenhouse tab (not Combined).
  const overviewConfiguredSensors = React.useMemo<OverviewConfiguredSensor[]>(() => {
    if (activeGreenhouseTab === 0) return [];
    const gh = tenantGreenhouses[activeGreenhouseTab - 1];
    if (!gh) return [];

    const deviceGreenhouse = new Map<string, string | undefined | null>();
    for (const [device, cfg] of sensorConfigMap.entries()) {
      if (cfg.greenhouse === gh.name) deviceGreenhouse.set(device, gh.name);
    }
    if (deviceGreenhouse.size === 0) return [];

    const layout: GreenhouseLayout = {
      name: gh.name,
      xDimension: gh.xDimension,
      yDimension: gh.yDimension,
      bayCount: gh.bayCount ?? null,
    };
    const defaults = computeDefaultSensorPositions(deviceGreenhouse, [layout]);

    const out: OverviewConfiguredSensor[] = [];
    for (const device of deviceGreenhouse.keys()) {
      const cfg = sensorConfigMap.get(device);
      const { xPosition, yPosition } = resolveSensorPosition(
        cfg,
        defaults.get(device),
      );
      if (
        typeof xPosition !== 'number' ||
        typeof yPosition !== 'number' ||
        !Number.isFinite(xPosition) ||
        !Number.isFinite(yPosition)
      ) {
        continue;
      }
      out.push({
        device,
        greenhouse: gh.name,
        xPosition,
        yPosition,
        hidden: cfg?.hiddenInFarmOverview === true,
      });
    }
    return out;
  }, [activeGreenhouseTab, tenantGreenhouses, sensorConfigMap]);

  // Bays returned by influxRowsToBays are sorted alphabetically by chamber
  // name and only include greenhouses that currently emit sensor data — so
  // the array indices do NOT align with `tenantGreenhouses` indices. Match
  // by name (with fallbacks to handle bays still keyed on the raw InfluxDB
  // tag like "greenhouse_03"); see findBayForGreenhouse.
  const selectedBays = React.useMemo(() => {
    if (activeGreenhouseTab === 0) return bays; // combined
    const idx = activeGreenhouseTab - 1;
    const gh = tenantGreenhouses[idx];
    if (!gh) return [];
    const bay = findBayForGreenhouse(bays, gh.name, idx, {
      totalGreenhouses: tenantGreenhouses.length,
      sensorConfigMap,
    });
    if (bay) return [bay];
    // No live data for this greenhouse. On the Sensor Overview tab we still
    // want to show the full installed fleet, so synthesize an empty bay to
    // host the configured sensor markers.
    if (
      effectiveParameter === SENSOR_OVERVIEW_PARAMETER &&
      overviewConfiguredSensors.length > 0
    ) {
      return [createEmptyBay(gh.name)];
    }
    return [];
  }, [
    activeGreenhouseTab,
    bays,
    tenantGreenhouses,
    sensorConfigMap,
    effectiveParameter,
    overviewConfiguredSensors,
  ]);

  // Map each slot id to its REAL InfluxDB `greenhouse` tag (from slot meta),
  // so the history drawer can scope its query to the exact series. The slot
  // id's own greenhouse segment can be an assigned display name, so it must
  // not be used as a tag filter (VSL-221).
  const selectedSlotGreenhouse = React.useMemo<string | null>(() => {
    if (!selectedSlotId) return null;
    for (const bay of bays) {
      for (const row of bay.rows) {
        for (const col of row.columns) {
          for (const slot of col.slots) {
            if (slot.id === selectedSlotId) {
              const gh = slot.meta?.influxGreenhouse;
              return typeof gh === 'string' && gh ? gh : null;
            }
          }
        }
      }
    }
    return null;
  }, [bays, selectedSlotId]);

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
    if (tenantGreenhouses.length === 0) {
      // Fallback: no tenant greenhouses configured — synthesize from layout.
      return Array.from({ length: farmLayout.chambersCount }, (_, i) => ({
        key: bays[i]?.id ?? `greenhouse_${i + 1}`,
        label: ghLabels[i] || `Greenhouse ${i + 1}`,
        bay: bays[i] ?? null,
      }));
    }
    // Match each greenhouse to its bay (see selectedBays note + helper).
    return tenantGreenhouses.map((gh, i) => {
      const bay = findBayForGreenhouse(bays, gh.name, i, {
        totalGreenhouses: tenantGreenhouses.length,
        sensorConfigMap,
      });
      return {
        key: bay?.id ?? `greenhouse_${i + 1}`,
        label: gh.name || ghLabels[i] || `Greenhouse ${i + 1}`,
        bay,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bays,
    farmLayout.chambersCount,
    tenantGreenhouses,
    sensorConfigMap,
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
        isHorizontal: gh.isHorizontal ?? false,
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
    overviewEnabled,
    effectiveParameter,
    setSelectedParameter,
    activeGreenhouseTab,
    setActiveGreenhouseTab,
    isCombinedView: activeGreenhouseTab === 0,
    viewMode,
    setViewMode,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlotGreenhouse,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    bays: selectedBays,
    overviewConfiguredSensors,
    greenhouseLabel,
    combinedGreenhouses,
    getParameterLabel,
    handleSensorPositionCommit,
    savingDeviceId,
    positionErrorDeviceId,
    tenantBucketNameOverride,
    tenantIdOverride,
    farmLayout,
    greenhouseDimensions: selectedGreenhouseDimensions,
    disabledSensorFields: disabledSensorFieldsSet,
    handleToggleSensorField,
    savingSensorFields,
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
