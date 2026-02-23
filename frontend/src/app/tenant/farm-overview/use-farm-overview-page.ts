'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { formatFieldToLabel } from '@/lib/farm-data'
import type { ParameterType } from '@/lib/farm-types'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useLiveFarmData } from '@/lib/hooks/use-live-farm-data'
import { useTenantBucketName } from '@/lib/hooks/use-tenant-bucket'
import { UserRole, useTenantsQuery, type Tenant } from '@/generated/graphql'

const GREENHOUSE_LABEL_KEYS = ['greenHouse1', 'greenHouse2'] as const

export interface FarmOverviewTranslations {
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
  emptyForNow?: string
  noSensor: string
  noData: string
}

export function useFarmOverviewPage(t: FarmOverviewTranslations) {
  const { role } = useCurrentUser()
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

  const { bays, bucketFields, loading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
  })

  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>('temperature')
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  )
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'heatmap' | 'discrete'>(
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

  const getParameterLabel = React.useCallback(
    (param: ParameterType) => formatFieldToLabel(param),
    [],
  )

  const tenantSelectorValue =
    selectedTenantId && tenants.some((tn) => tn.id === selectedTenantId)
      ? selectedTenantId
      : (tenants[0]?.id ?? '')

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
    viewMode,
    setViewMode,
    selectedSlotId,
    setSelectedSlotId,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    bays,
    getParameterLabel,
    tenantBucketNameOverride,
    labels: {
      viewHeatmap: t.viewHeatmap,
      viewDiscrete: t.viewDiscrete,
      emptyForNow: t.emptyForNow ?? 'Empty for now',
      noSensor: t.noSensor,
      noData: t.noData,
      greenHouse1: t.greenHouse1,
    },
  }
}
