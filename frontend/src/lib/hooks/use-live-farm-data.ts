'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import type { Bay } from '@/lib/farm-types'
import { generateFarm } from '@/lib/farm-data'
import { influxRowsToBays } from '@/lib/farm-data-live'
import { useMeQuery, useGetBucketDataQuery } from '@/generated/graphql'
import { GET_BUCKET_FIELDS_QUERY } from '@/graphql/queries/influxdb.queries'

const BUCKET_START_DEFAULT = '-1h'
const BUCKET_LIMIT = 500

function toISOStart(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`
}
function toISOEndNextDay(dateStr: string): string {
  const d = new Date(dateStr)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString()
}

export interface LiveFarmDataRange {
  dateFrom?: string
  dateTo?: string
  selectedDay?: string
}

interface GetBucketFieldsResponse {
  getBucketFields: string[]
}

export function useLiveFarmData(range?: LiveFarmDataRange): {
  bays: Bay[]
  bucketFields: string[]
  loading: boolean
  error: Error | null
  isLive: boolean
} {
  const { data: meData, loading: meLoading } = useMeQuery({
    fetchPolicy: 'cache-first',
  })
  const bucketName = meData?.me?.tenant?.influxBucketName ?? null

  const startStop = useMemo(() => {
    if (!range)
      return {
        start: BUCKET_START_DEFAULT,
        stop: undefined as string | undefined,
      }
    if (range.selectedDay) {
      return {
        start: toISOStart(range.selectedDay),
        stop: toISOEndNextDay(range.selectedDay),
      }
    }
    if (range.dateFrom && range.dateTo) {
      return {
        start: toISOStart(range.dateFrom),
        stop: toISOEndNextDay(range.dateTo),
      }
    }
    return {
      start: BUCKET_START_DEFAULT,
      stop: undefined as string | undefined,
    }
  }, [range])

  const {
    data: bucketData,
    loading: bucketLoading,
    error: bucketError,
  } = useGetBucketDataQuery({
    variables: {
      bucketName: bucketName ?? '',
      start: startStop.start,
      limit: BUCKET_LIMIT,
    },
    skip: !bucketName,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  })

  const { data: fieldsData } = useQuery<GetBucketFieldsResponse>(
    GET_BUCKET_FIELDS_QUERY,
    {
      variables: {
        bucketName: bucketName ?? '',
        start: startStop.start,
        ...(startStop.stop != null && { stop: startStop.stop }),
      },
      skip: !bucketName,
      fetchPolicy: 'cache-first',
    }
  )

  const bucketFields = useMemo(
    () => (fieldsData?.getBucketFields ?? []).slice().sort(),
    [fieldsData?.getBucketFields]
  )

  return useMemo(() => {
    const loading = meLoading || (!!bucketName && bucketLoading)
    const error = bucketError ?? null

    if (
      bucketName &&
      bucketData?.getBucketData &&
      bucketData.getBucketData.length > 0
    ) {
      try {
        const bays = influxRowsToBays(bucketData.getBucketData)
        if (bays.length > 0) {
          return {
            bays,
            bucketFields,
            loading,
            error: null,
            isLive: true,
          }
        }
      } catch (e) {
        return {
          bays: generateFarm().bays,
          bucketFields,
          loading,
          error: e instanceof Error ? e : new Error(String(e)),
          isLive: false,
        }
      }
    }

    return {
      bays: generateFarm().bays,
      bucketFields,
      loading,
      error,
      isLive: false,
    }
  }, [
    meLoading,
    bucketName,
    bucketLoading,
    bucketData,
    bucketError,
    bucketFields,
  ])
}
