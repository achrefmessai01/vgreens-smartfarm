'use client';

import {
  useMeQuery,
  useGetBucketDataQuery,
  useGetBucketFieldsQuery,
} from '@/generated/graphql';
import { useMemo } from 'react';
import type { Bay } from '@/types/farm.types';
import { generateFarm } from '@/lib/farm-data';
import { influxRowsToBays } from '@/lib/farm-data-live';

const BUCKET_START_DEFAULT = '-1h';
const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

function toISOStart(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`;
}
function toISOEndNextDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

export interface LiveFarmDataRange {
  dateFrom?: string;
  dateTo?: string;
  selectedDay?: string;
}

export interface LiveFarmDataOptions {
  range?: LiveFarmDataRange;
  tenantBucketName?: string | null;
}

export function useLiveFarmData(
  options?: LiveFarmDataRange | LiveFarmDataOptions,
): {
  bays: Bay[];
  bucketFields: string[];
  loading: boolean;
  error: Error | null;
  isLive: boolean;
} {
  const range =
    options && 'range' in options
      ? options.range
      : (options as LiveFarmDataRange | undefined);

  const tenantBucketOverride =
    options && 'tenantBucketName' in options
      ? options.tenantBucketName
      : undefined;

  const { data: meData, loading: meLoading } = useMeQuery({
    fetchPolicy: 'cache-first',
  });
  const bucketNameFromMe = meData?.me?.tenant?.influxBucketName ?? null;
  const bucketName = tenantBucketOverride ?? bucketNameFromMe;

  const startStop = useMemo(() => {
    if (!range)
      return {
        start: BUCKET_START_DEFAULT,
        stop: undefined as string | undefined,
      };
    if (range.selectedDay) {
      return {
        start: toISOStart(range.selectedDay),
        stop: toISOEndNextDay(range.selectedDay),
      };
    }
    if (range.dateFrom && range.dateTo) {
      return {
        start: toISOStart(range.dateFrom),
        stop: toISOEndNextDay(range.dateTo),
      };
    }
    return {
      start: BUCKET_START_DEFAULT,
      stop: undefined as string | undefined,
    };
  }, [range]);

  const {
    data: bucketData,
    loading: bucketLoading,
    error: bucketError,
  } = useGetBucketDataQuery({
    variables: {
      input: {
        bucketName: bucketName ?? '',
        start: startStop.start,
        stop: startStop.stop ?? undefined,
        useLastPerSeries: true,
      },
    },
    skip: !bucketName,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: POLL_INTERVAL_MS,
  });

  const { data: fieldsData } = useGetBucketFieldsQuery({
    variables: {
      bucketName: bucketName ?? '',
      start: startStop.start,
      ...(startStop.stop != null && { stop: startStop.stop }),
    },
    skip: !bucketName,
    fetchPolicy: 'cache-first',
  });

  const bucketFields = useMemo(
    () => (fieldsData?.getBucketFields ?? []).slice().sort(),
    [fieldsData?.getBucketFields],
  );

  return useMemo(() => {
    const loading = meLoading || (!!bucketName && bucketLoading);
    const error = bucketError ?? null;

    if (
      bucketName &&
      bucketData?.getBucketData &&
      bucketData.getBucketData.length > 0
    ) {
      try {
        const bays = influxRowsToBays(bucketData.getBucketData);
        if (bays.length > 0) {
          return {
            bays,
            bucketFields,
            loading,
            error: null,
            isLive: true,
          };
        }
      } catch (e) {
        return {
          bays: generateFarm().bays,
          bucketFields,
          loading,
          error: e instanceof Error ? e : new Error(String(e)),
          isLive: false,
        };
      }
    }

    return {
      bays: generateFarm().bays,
      bucketFields,
      loading,
      error,
      isLive: false,
    };
  }, [
    meLoading,
    bucketName,
    bucketLoading,
    bucketData,
    bucketError,
    bucketFields,
  ]);
}
