'use client'

import * as React from 'react'
import { useQuery } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { formatFieldToLabel } from '@/lib/farm-data'
import type { ParameterType } from '@/lib/farm-types'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data'
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket'
import { GET_BUCKET_FIELD_MEANS_LAST_MINUTES_QUERY } from '@/graphql/queries'
import { UserRole, useTenantsQuery, type Tenant } from '@/generated/graphql'

const GREENHOUSE_LABEL_KEYS = ['combined', 'greenHouse1', 'greenHouse2'] as const
const FIELD_MEANS_POLL_INTERVAL_MS = 2 * 60 * 1000
const UNASSIGNED_GREENHOUSE_KEY = '__all__'

interface FieldMeanMetric {
  field: string
  greenhouse?: string | null
  value: number
}

interface GetBucketFieldMeansLastMinutesResponse {
  getBucketFieldMeansLastMinutes: FieldMeanMetric[]
}

interface GetBucketFieldMeansLastMinutesVariables {
  input: {
    bucketName: string
    windowMinutes: number
  }
}

export interface FarmOverviewTranslations {
  combined: string
  greenHouse1: string
  greenHouse2: string
  temperature: string
  humidity: string
  co2: string
  soilEC: string
  soilMoisture: string
  vpd: string
  par: string
  viewHeatmap: string
  viewDiscrete: string
  viewGraph: string
  emptyForNow?: string
  noSensor: string
  noData: string
}

export function useFarmOverviewPage(t: FarmOverviewTranslations) {
  const { role, user } = useCurrentUser()
  const isVGreensAdmin = role === UserRole.VgreensAdmin
  const searchParams = useSearchParams()
  const initialTenantIdFromUrl = searchParams.get('tenantId') ?? ''

  const { data: tenantsData } = useTenantsQuery({
    skip: !isVGreensAdmin,
    fetchPolicy: 'cache-first',
  })
  const tenants = React.useMemo(
    () => (tenantsData?.tenants || []) as Tenant[],
    [tenantsData?.tenants],
  )

  const [selectedTenantId, setSelectedTenantId] = React.useState<string>(
    initialTenantIdFromUrl,
  )

  React.useEffect(() => {
    if (!isVGreensAdmin || tenants.length === 0) return
    if (
      initialTenantIdFromUrl &&
      tenants.some((tn) => tn.id === initialTenantIdFromUrl)
    ) {
      setSelectedTenantId(initialTenantIdFromUrl)
      return
    }
    const valid =
      selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId)
    if (!valid) setSelectedTenantId(tenants[0].id)
  }, [isVGreensAdmin, tenants, selectedTenantId, initialTenantIdFromUrl])

  const handleTenantChange = React.useCallback((tenantId: string) => {
    setSelectedTenantId(tenantId)
    if (typeof window !== 'undefined' && tenantId) {
      const url = new URL(window.location.href)
      url.searchParams.set('tenantId', tenantId)
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const { bucketName: selectedTenantBucketName } = useTenantBucketName(
    isVGreensAdmin ? selectedTenantId : undefined,
  )
  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined
  const activeBucketName =
    isVGreensAdmin
      ? (selectedTenantBucketName ?? null)
      : (user?.tenant?.influxBucketName ?? null)

  const { bays, bucketFields, loading: liveDataLoading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
  })
  const { data: fieldMeansData, loading: fieldMeansLoading } = useQuery<
    GetBucketFieldMeansLastMinutesResponse,
    GetBucketFieldMeansLastMinutesVariables
  >(GET_BUCKET_FIELD_MEANS_LAST_MINUTES_QUERY, {
    variables: {
      input: {
        bucketName: activeBucketName ?? '',
        windowMinutes: 5,
      },
    },
    skip: !activeBucketName,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: FIELD_MEANS_POLL_INTERVAL_MS,
  })

  const fieldMeansByGreenhouse = React.useMemo(() => {
    const grouped = new Map<string, Record<string, number>>()

    for (const metric of fieldMeansData?.getBucketFieldMeansLastMinutes ?? []) {
      const field = metric.field?.trim()
      if (!field) continue

      const greenhouseKey =
        metric.greenhouse?.trim() || UNASSIGNED_GREENHOUSE_KEY

      const byField = grouped.get(greenhouseKey) ?? {}
      byField[field] = metric.value
      grouped.set(greenhouseKey, byField)
    }

    return grouped
  }, [fieldMeansData?.getBucketFieldMeansLastMinutes])

  const greenhouseKeysForFallback = React.useMemo(
    () =>
      Array.from(fieldMeansByGreenhouse.keys())
        .filter((key) => key !== UNASSIGNED_GREENHOUSE_KEY)
        .sort(),
    [fieldMeansByGreenhouse],
  )

  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('temperature')
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  )
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<
    'heatmap' | 'discrete' | 'graph'
  >(
    'discrete',
  )
  const [activeGreenhouseTab, setActiveGreenhouseTab] = React.useState(0)

  const greenhouseOptions = React.useMemo(
    () => GREENHOUSE_LABEL_KEYS.map((key) => ({ key, label: t[key] })),
    [t],
  )

  const parameterOptions = React.useMemo(() => {
    if (bucketFields.length === 0) {
      return [
        { label: t.temperature, value: 'temperature' },
        { label: t.humidity, value: 'humidity' },
        { label: t.co2, value: 'co2' },
        { label: t.soilEC, value: 'soil_ec' },
        { label: t.soilMoisture, value: 'soil_moisture' },
        { label: t.vpd, value: 'vpd' },
        { label: t.par, value: 'par' },
      ]
    }
    const hasPar = bucketFields.includes('par')
    const hasParEstimated = bucketFields.includes('par_estimated')
    const baseFields = bucketFields.filter(
      (f) => f !== 'lux' && f !== 'par' && f !== 'par_estimated',
    )
    const options = baseFields.map((field) => ({
      label: formatFieldToLabel(field),
      value: field,
    }))
    const parField: ParameterType | null = hasParEstimated
      ? 'par_estimated'
      : hasPar
        ? 'par'
        : null
    if (parField) {
      options.push({ label: formatFieldToLabel('par'), value: parField })
    }
    return options
  }, [bucketFields, t])

  const effectiveParameter =
    selectedParameter && bucketFields.includes(selectedParameter)
      ? selectedParameter
      : (bucketFields[0] ?? 'temperature')

  React.useEffect(() => {
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0])
    }
  }, [bucketFields, selectedParameter])

  React.useEffect(() => {
    if (selectedSlotId) setHistoryDrawerOpen(true)
  }, [selectedSlotId])

  React.useEffect(() => {
    const isParParameter =
      effectiveParameter === 'par' || effectiveParameter === 'par_estimated'
    if (isParParameter) {
      setViewMode((current) => (current === 'graph' ? current : 'graph'))
      return
    }
    setViewMode((current) => (current === 'graph' ? 'discrete' : current))
  }, [effectiveParameter])

  React.useEffect(() => {
    setSelectedSlotId(null)
    setHistoryDrawerOpen(false)
  }, [activeGreenhouseTab])

  const greenhouseBays = React.useMemo(
    () => [bays[0] ?? null, bays[1] ?? null] as const,
    [bays],
  )

  const selectedBays = React.useMemo(() => {
    if (activeGreenhouseTab === 1) {
      return greenhouseBays[0] ? [greenhouseBays[0]] : []
    }
    if (activeGreenhouseTab === 2) {
      return greenhouseBays[1] ? [greenhouseBays[1]] : []
    }
    return bays
  }, [activeGreenhouseTab, greenhouseBays, bays])

  const combinedGreenhouses = React.useMemo(
    () => {
      const first = bays[0] ?? null
      const second = bays[1] ?? null
      const resolveMeanValues = (
        greenhouseName: string | undefined,
        fallbackIndex: number,
      ): Record<string, number> => {
        if (greenhouseName && fieldMeansByGreenhouse.has(greenhouseName)) {
          return fieldMeansByGreenhouse.get(greenhouseName) ?? {}
        }

        const fallbackGreenhouseKey = greenhouseKeysForFallback[fallbackIndex]
        if (fallbackGreenhouseKey) {
          return fieldMeansByGreenhouse.get(fallbackGreenhouseKey) ?? {}
        }

        return fieldMeansByGreenhouse.get(UNASSIGNED_GREENHOUSE_KEY) ?? {}
      }

      return [
        {
          key: first?.id ?? 'greenHouse1',
          label: t.greenHouse1,
          meanValues: resolveMeanValues(first?.name, 0),
        },
        {
          key: second?.id ?? 'greenHouse2',
          label: t.greenHouse2,
          meanValues: resolveMeanValues(second?.name, 1),
        },
      ]
    },
    [
      bays,
      t.greenHouse1,
      t.greenHouse2,
      fieldMeansByGreenhouse,
      greenhouseKeysForFallback,
    ],
  )

  const getParameterLabel = React.useCallback(
    (param: ParameterType) => formatFieldToLabel(param),
    [],
  )

  const tenantSelectorValue =
    selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId)
      ? selectedTenantId
      : (tenants[0]?.id ?? '')
  const loading = liveDataLoading || (!!activeBucketName && fieldMeansLoading)

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
  }
}
