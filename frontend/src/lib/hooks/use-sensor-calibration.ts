'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CALIBRATION_READING_QUERY,
  SOIL_SENSOR_CONFIGS_QUERY,
} from '@/graphql/queries/sensor-calibration.queries';
import {
  CAPTURE_DRY_CALIBRATION_MUTATION,
  CAPTURE_SATURATED_CALIBRATION_MUTATION,
} from '@/graphql/mutations/sensor-calibration.mutations';

// These operations are hand-typed rather than generated because `npm run
// codegen` needs a running backend. Once the backend is up, running codegen
// will produce equivalent `useSoilSensorConfigsQuery` etc. hooks that can
// replace these; the gql documents already live in src/graphql.

/** How often to poll for the first real reading after the operator presses. */
const READING_POLL_MS = 20_000;
/** Give up after ~2 transmit cycles + jitter (survives one dropped packet). */
const CAPTURE_TIMEOUT_MS = 25 * 60 * 1000;

export interface SoilSensorConfig {
  id: string;
  device: string;
  greenhouse: string | null;
  avgDryReading: number | null;
  avgSaturatedReading: number | null;
  isCalibrated: boolean;
}

interface SoilSensorConfigsData {
  soilSensorConfigs: SoilSensorConfig[];
}
interface SoilSensorConfigsVars {
  tenantId?: string | null;
}

interface CalibrationReadingData {
  calibrationReading: { value: number; time: string } | null;
}
interface CalibrationReadingVars {
  sensorConfigId: string;
  since: string;
  tenantId?: string | null;
}

interface CaptureVars {
  sensorConfigId: string;
  since: string;
  tenantId?: string | null;
}
interface CaptureDryData {
  captureDryCalibration: SoilSensorConfig;
}
interface CaptureSaturatedData {
  captureSaturatedCalibration: SoilSensorConfig;
}

/** The tenant's soil sensor configs (with calibration bounds). */
export function useSoilSensorConfigs(tenantId?: string | null) {
  const { data, loading, refetch } = useQuery<
    SoilSensorConfigsData,
    SoilSensorConfigsVars
  >(SOIL_SENSOR_CONFIGS_QUERY, {
    variables: { tenantId: tenantId ?? null },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  return {
    configs: data?.soilSensorConfigs ?? [],
    loading,
    refetch,
  };
}

export type CaptureBound = 'dry' | 'saturated';
/** idle → waiting (for a transmission) → saving (persisting) → idle | error. */
export type CaptureStatus = 'idle' | 'waiting' | 'saving' | 'error';

/**
 * Drives one sensor's calibration capture. Capture policy is "exactly one fresh
 * point": on start we stamp `since = now`, poll `calibrationReading` until the
 * first real datapoint after `since` lands, then fire the persist mutation.
 */
export function useSensorCalibrationCapture(params: {
  sensorConfigId: string | null;
  tenantId?: string | null;
  onCalibrated?: () => void;
}) {
  const { sensorConfigId, tenantId, onCalibrated } = params;
  const [bound, setBound] = React.useState<CaptureBound | null>(null);
  const [since, setSince] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<CaptureStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  // Guards against firing the persist mutation more than once per capture.
  const firedRef = React.useRef(false);

  const [captureDry] = useMutation<CaptureDryData, CaptureVars>(
    CAPTURE_DRY_CALIBRATION_MUTATION,
  );
  const [captureSaturated] = useMutation<CaptureSaturatedData, CaptureVars>(
    CAPTURE_SATURATED_CALIBRATION_MUTATION,
  );

  const waiting = status === 'waiting';

  const { data: readingData } = useQuery<
    CalibrationReadingData,
    CalibrationReadingVars
  >(CALIBRATION_READING_QUERY, {
    variables: {
      sensorConfigId: sensorConfigId ?? '',
      since: since ?? '',
      tenantId: tenantId ?? null,
    },
    skip: !waiting || !sensorConfigId || !since,
    fetchPolicy: 'network-only',
    pollInterval: READING_POLL_MS,
  });

  // Timeout: stop waiting if no transmission arrives within the window.
  React.useEffect(() => {
    if (status !== 'waiting' || !since) return;
    const startedAt = new Date(since).getTime();
    const timer = window.setInterval(() => {
      if (Date.now() - startedAt > CAPTURE_TIMEOUT_MS) {
        setStatus('error');
        setError(
          'No sensor reading received in time. Check the sensor is online and try again.',
        );
        setBound(null);
      }
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [status, since]);

  // When the first fresh reading arrives, persist it via the matching mutation.
  React.useEffect(() => {
    if (status !== 'waiting' || firedRef.current) return;
    const reading = readingData?.calibrationReading;
    if (!reading || !sensorConfigId || !since || !bound) return;
    firedRef.current = true;
    setStatus('saving');
    const run = bound === 'dry' ? captureDry : captureSaturated;
    run({ variables: { sensorConfigId, since, tenantId: tenantId ?? null } })
      .then(() => {
        setStatus('idle');
        setBound(null);
        setSince(null);
        onCalibrated?.();
      })
      .catch((e: unknown) => {
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
        setBound(null);
      });
  }, [
    readingData,
    status,
    bound,
    sensorConfigId,
    since,
    tenantId,
    captureDry,
    captureSaturated,
    onCalibrated,
  ]);

  const start = React.useCallback(
    (next: CaptureBound) => {
      if (!sensorConfigId) return;
      firedRef.current = false;
      setError(null);
      setBound(next);
      setSince(new Date().toISOString());
      setStatus('waiting');
    },
    [sensorConfigId],
  );

  const cancel = React.useCallback(() => {
    firedRef.current = false;
    setStatus('idle');
    setBound(null);
    setSince(null);
    setError(null);
  }, []);

  return {
    status,
    bound,
    error,
    busy: status === 'waiting' || status === 'saving',
    startDry: React.useCallback(() => start('dry'), [start]),
    startSaturated: React.useCallback(() => start('saturated'), [start]),
    cancel,
  };
}
