'use client';

import * as React from 'react';
import { useApolloClient } from '@apollo/client';
import { CALIBRATION_READING_QUERY } from '@/graphql/queries/sensor-calibration.queries';
import {
  CAPTURE_DRY_CALIBRATION_MUTATION,
  CAPTURE_SATURATED_CALIBRATION_MUTATION,
} from '@/graphql/mutations/sensor-calibration.mutations';

// Hand-typed rather than generated — see use-sensor-calibration.ts.

/** How often to poll for the first real reading after the operator presses. */
const READING_POLL_MS = 20_000;
/** Give up after ~2 transmit cycles + jitter (survives one dropped packet). */
const CAPTURE_TIMEOUT_MS = 25 * 60 * 1000;

export type CalibrationPhase = 'dry' | 'saturated';
/** waiting (for a transmission) → saving (persisting) → gone | error. */
export type SensorCaptureStatus = 'waiting' | 'saving' | 'error';

export interface SensorCaptureState {
  phase: CalibrationPhase;
  status: SensorCaptureStatus;
  error: string | null;
  /** Epoch ms when the operator pressed calibrate — drives the row timer. */
  startedAt: number;
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

interface CaptureToken {
  cancelled: boolean;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Drives calibration captures for EVERY sensor in an irrigation cycle, each
 * with its own independent lifecycle: soil sensors transmit on independent
 * (~10 min) schedules, so a bulk run is N parallel "exactly one fresh point"
 * captures that will not finish together. Per sensor: stamp `since = now`,
 * poll `calibrationReading` until the first real datapoint after `since`
 * lands, then fire the phase's persist mutation.
 *
 * One capture per sensor at a time (a sensor is physically either dry or
 * saturated). State is client-side only — cancelling or closing the sidebar
 * abandons the in-flight captures.
 */
export function useCycleCalibration(params: {
  tenantId?: string | null;
  /** Called after each sensor's bound persists (refetch cycles/configs). */
  onCalibrated?: () => void;
}) {
  const { tenantId, onCalibrated } = params;
  const client = useApolloClient();
  const [captures, setCaptures] = React.useState<
    Record<string, SensorCaptureState>
  >({});
  const tokensRef = React.useRef(new Map<string, CaptureToken>());
  const onCalibratedRef = React.useRef(onCalibrated);
  React.useEffect(() => {
    onCalibratedRef.current = onCalibrated;
  });

  const patchCapture = React.useCallback(
    (sensorConfigId: string, state: SensorCaptureState | null) => {
      setCaptures((prev) => {
        if (state === null) {
          if (!(sensorConfigId in prev)) return prev;
          const next = { ...prev };
          delete next[sensorConfigId];
          return next;
        }
        return { ...prev, [sensorConfigId]: state };
      });
    },
    [],
  );

  const runCapture = React.useCallback(
    async (
      sensorConfigId: string,
      phase: CalibrationPhase,
      since: string,
      startedAt: number,
      token: CaptureToken,
    ): Promise<void> => {
      const fail = (message: string) =>
        patchCapture(sensorConfigId, {
          phase,
          status: 'error',
          error: message,
          startedAt,
        });
      try {
        while (!token.cancelled) {
          if (Date.now() - startedAt > CAPTURE_TIMEOUT_MS) {
            fail(
              'No sensor reading received in time. Check the sensor is online and try again.',
            );
            return;
          }
          const { data } = await client.query<
            CalibrationReadingData,
            CalibrationReadingVars
          >({
            query: CALIBRATION_READING_QUERY,
            variables: { sensorConfigId, since, tenantId: tenantId ?? null },
            fetchPolicy: 'network-only',
          });
          if (token.cancelled) return;
          if (data?.calibrationReading) {
            patchCapture(sensorConfigId, {
              phase,
              status: 'saving',
              error: null,
              startedAt,
            });
            await client.mutate<unknown, CaptureVars>({
              mutation:
                phase === 'dry'
                  ? CAPTURE_DRY_CALIBRATION_MUTATION
                  : CAPTURE_SATURATED_CALIBRATION_MUTATION,
              variables: { sensorConfigId, since, tenantId: tenantId ?? null },
            });
            if (token.cancelled) return;
            patchCapture(sensorConfigId, null);
            onCalibratedRef.current?.();
            return;
          }
          await sleep(READING_POLL_MS);
        }
      } catch (e: unknown) {
        if (!token.cancelled) {
          fail(e instanceof Error ? e.message : String(e));
        }
      } finally {
        // Error rows keep their state (dismissed via cancel or a restart) but
        // release the token so the sensor can be recalibrated.
        tokensRef.current.delete(sensorConfigId);
      }
    },
    [client, patchCapture, tenantId],
  );

  const start = React.useCallback(
    (sensorConfigId: string, phase: CalibrationPhase) => {
      // One capture per sensor at a time; restarting from an error is fine
      // (its token is already released).
      if (tokensRef.current.has(sensorConfigId)) return;
      const token: CaptureToken = { cancelled: false };
      tokensRef.current.set(sensorConfigId, token);
      const startedAt = Date.now();
      const since = new Date(startedAt).toISOString();
      patchCapture(sensorConfigId, {
        phase,
        status: 'waiting',
        error: null,
        startedAt,
      });
      void runCapture(sensorConfigId, phase, since, startedAt, token);
    },
    [patchCapture, runCapture],
  );

  /** Bulk: start the phase for every given sensor (busy ones are skipped). */
  const startAll = React.useCallback(
    (sensorConfigIds: string[], phase: CalibrationPhase) => {
      for (const id of sensorConfigIds) start(id, phase);
    },
    [start],
  );

  /** Abandon a sensor's capture (also dismisses its error row). */
  const cancel = React.useCallback(
    (sensorConfigId: string) => {
      const token = tokensRef.current.get(sensorConfigId);
      if (token) token.cancelled = true;
      tokensRef.current.delete(sensorConfigId);
      patchCapture(sensorConfigId, null);
    },
    [patchCapture],
  );

  const cancelAll = React.useCallback(() => {
    for (const token of tokensRef.current.values()) token.cancelled = true;
    tokensRef.current.clear();
    setCaptures({});
  }, []);

  // Abandon everything on unmount so no loop mutates after the UI is gone.
  React.useEffect(() => {
    const tokens = tokensRef.current;
    return () => {
      for (const token of tokens.values()) token.cancelled = true;
      tokens.clear();
    };
  }, []);

  // True while any sensor is waiting/saving — the sidebar must not close on
  // outside clicks during this.
  const anyBusy = React.useMemo(
    () =>
      Object.values(captures).some(
        (c) => c.status === 'waiting' || c.status === 'saving',
      ),
    [captures],
  );

  // Ticks once a second while captures run, so rows can render elapsed time.
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!anyBusy) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, [anyBusy]);

  return { captures, anyBusy, now, start, startAll, cancel, cancelAll };
}
