'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { IRRIGATION_CYCLES_QUERY } from '@/graphql/queries/irrigation-cycles.queries';
import {
  ASSIGN_SENSOR_TO_IRRIGATION_CYCLE_MUTATION,
  CREATE_IRRIGATION_CYCLE_MUTATION,
  DELETE_IRRIGATION_CYCLE_MUTATION,
  UPDATE_IRRIGATION_CYCLE_MUTATION,
} from '@/graphql/mutations/irrigation-cycles.mutations';

// Hand-typed rather than generated for the same reason as
// use-sensor-calibration.ts: `npm run codegen` needs a running backend. The
// gql documents live in src/graphql, so a later codegen run can swap these
// for generated hooks.

/** A soil sensor as it appears inside an irrigation cycle. */
export interface IrrigationCycleSensor {
  id: string;
  device: string;
  greenhouseId: string | null;
  irrigationCycleId: string | null;
  avgDryReading: number | null;
  avgSaturatedReading: number | null;
  isCalibrated: boolean;
}

export interface IrrigationCycle {
  id: string;
  name: string;
  greenhouseId: string | null;
  greenhouse: string | null;
  sensors: IrrigationCycleSensor[];
}

interface IrrigationCyclesData {
  irrigationCycles: IrrigationCycle[];
}
interface IrrigationCyclesVars {
  tenantId?: string | null;
}

/**
 * The tenant's irrigation cycles with assigned sensors. Admin-only — pass
 * `undefined` (skips the query) for non-admin contexts.
 */
export function useIrrigationCycles(tenantId?: string | null) {
  const { data, loading, refetch } = useQuery<
    IrrigationCyclesData,
    IrrigationCyclesVars
  >(IRRIGATION_CYCLES_QUERY, {
    variables: { tenantId: tenantId ?? null },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  return {
    cycles: data?.irrigationCycles ?? [],
    loading,
    refetch,
  };
}

interface CreateCycleData {
  createIrrigationCycle: { id: string };
}
interface CreateCycleVars {
  input: { name: string; greenhouseId: string };
  tenantId?: string | null;
}

interface UpdateCycleData {
  updateIrrigationCycle: { id: string; name: string };
}
interface UpdateCycleVars {
  id: string;
  input: { name?: string };
  tenantId?: string | null;
}

interface DeleteCycleData {
  deleteIrrigationCycle: boolean;
}
interface DeleteCycleVars {
  id: string;
  tenantId?: string | null;
}

interface AssignSensorData {
  assignSensorToIrrigationCycle: {
    id: string;
    device: string;
    irrigationCycleId: string | null;
  };
}
interface AssignSensorVars {
  sensorConfigId: string;
  irrigationCycleId: string | null;
  tenantId?: string | null;
}

/**
 * Mutations for managing irrigation cycles and their sensor assignments.
 * Every call refetches the cycles query so consumers re-render fresh data.
 */
export function useIrrigationCycleMutations(tenantId?: string | null) {
  const refetchQueries = React.useMemo(
    () => [
      {
        query: IRRIGATION_CYCLES_QUERY,
        variables: { tenantId: tenantId ?? null },
      },
    ],
    [tenantId],
  );

  const [createMutation, { loading: creating }] = useMutation<
    CreateCycleData,
    CreateCycleVars
  >(CREATE_IRRIGATION_CYCLE_MUTATION, { refetchQueries });
  const [updateMutation, { loading: updating }] = useMutation<
    UpdateCycleData,
    UpdateCycleVars
  >(UPDATE_IRRIGATION_CYCLE_MUTATION, { refetchQueries });
  const [deleteMutation, { loading: deleting }] = useMutation<
    DeleteCycleData,
    DeleteCycleVars
  >(DELETE_IRRIGATION_CYCLE_MUTATION, { refetchQueries });
  const [assignMutation, { loading: assigning }] = useMutation<
    AssignSensorData,
    AssignSensorVars
  >(ASSIGN_SENSOR_TO_IRRIGATION_CYCLE_MUTATION, { refetchQueries });

  const createCycle = React.useCallback(
    (name: string, greenhouseId: string) =>
      createMutation({
        variables: {
          input: { name, greenhouseId },
          tenantId: tenantId ?? null,
        },
      }),
    [createMutation, tenantId],
  );

  const renameCycle = React.useCallback(
    (id: string, name: string) =>
      updateMutation({
        variables: { id, input: { name }, tenantId: tenantId ?? null },
      }),
    [updateMutation, tenantId],
  );

  const deleteCycle = React.useCallback(
    (id: string) =>
      deleteMutation({ variables: { id, tenantId: tenantId ?? null } }),
    [deleteMutation, tenantId],
  );

  const assignSensor = React.useCallback(
    (sensorConfigId: string, irrigationCycleId: string | null) =>
      assignMutation({
        variables: {
          sensorConfigId,
          irrigationCycleId,
          tenantId: tenantId ?? null,
        },
      }),
    [assignMutation, tenantId],
  );

  return {
    createCycle,
    renameCycle,
    deleteCycle,
    assignSensor,
    saving: creating || updating || deleting || assigning,
  };
}
