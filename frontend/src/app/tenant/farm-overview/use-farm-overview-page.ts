'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { formatFieldToLabel } from '@/lib/farm-data';
import type { ParameterType } from '@/lib/farm-types';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data';
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket';
import { UserRole, useTenantsQuery, type Tenant } from '@/generated/graphql';

const GREENHOUSE_LABEL_KEYS = [
  'combined',
  'greenHouse1',
  'greenHouse2',
] as const;

export interface FarmOverviewTranslations {
  combined: string;
  greenHouse1: string;
  greenHouse2: string;
  temperature: string;
  humidity: string;
  co2: string;
  soilEC: string;
  soilMoisture: string;
  vpd: string;
  par: string;
  viewHeatmap: string;
  viewDiscrete: string;
  viewGraph: string;
  emptyForNow?: string;
  noSensor: string;
  noData: string;
}

export function useFarmOverviewPage(t: FarmOverviewTranslations) {
  const { role } = useCurrentUser();
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
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

  const { bucketName: selectedTenantBucketName } = useTenantBucketName(
    isVGreensAdmin ? selectedTenantId : undefined,
  );
  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined;

  const { bays, bucketFields, loading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
  });

  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('temperature');
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  );
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<
    'heatmap' | 'discrete' | 'graph'
  >('discrete');
  const [activeGreenhouseTab, setActiveGreenhouseTab] = React.useState(0);

  const greenhouseOptions = React.useMemo(
    () => GREENHOUSE_LABEL_KEYS.map((key) => ({ key, label: t[key] })),
    [t],
  );

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
    const allowedSingle: ParameterType[] = [
      'temperature',
      'humidity',
      'vpd',
      'par',
      'par_estimated',
    ];
    return allOptions.filter((opt) =>
      allowedSingle.includes(opt.value as ParameterType),
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
      const fallback = (parameterOptions[0]?.value as ParameterType) ?? 'temperature';
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

  const greenhouseBays = React.useMemo(
    () => [bays[0] ?? null, bays[1] ?? null] as const,
    [bays],
  );

  const selectedBays = React.useMemo(() => {
    if (activeGreenhouseTab === 1) {
      return greenhouseBays[0] ? [greenhouseBays[0]] : [];
    }
    if (activeGreenhouseTab === 2) {
      return greenhouseBays[1] ? [greenhouseBays[1]] : [];
    }
    return bays;
  }, [activeGreenhouseTab, greenhouseBays, bays]);

  // For now PAR data is only available for greenhouse_01 and light is shared,
  // so use the same greenhouse id for both Green House 1 and 2 graphs.
  const greenhouseId = React.useMemo(
    () => 'greenhouse_01',
    [],
  );

  const greenhouseLabel = React.useMemo(
    () => (activeGreenhouseTab === 1 ? t.greenHouse1 : t.greenHouse2),
    [activeGreenhouseTab, t.greenHouse1, t.greenHouse2],
  );

  const combinedGreenhouses = React.useMemo(() => {
    const first = bays[0] ?? null;
    const second = bays[1] ?? null;

    return [
      {
        key: first?.id ?? 'greenHouse1',
        label: t.greenHouse1,
        bay: first,
      },
      {
        key: second?.id ?? 'greenHouse2',
        label: t.greenHouse2,
        bay: second,
      },
    ];
  }, [bays, t.greenHouse1, t.greenHouse2]);

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
    tenants,
    selectedTenantId,
    handleTenantChange,
    tenantSelectorValue,
    loading,
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
    tenantBucketNameOverride,
    labels: {
      viewHeatmap: t.viewHeatmap,
      viewDiscrete: t.viewDiscrete,
      viewGraph: t.viewGraph,
      emptyForNow: t.emptyForNow ?? 'Empty for now',
      noSensor: t.noSensor,
      noData: t.noData,
      combined: t.combined,
      greenHouse1: t.greenHouse1,
      greenHouse2: t.greenHouse2,
    },
  };
}
