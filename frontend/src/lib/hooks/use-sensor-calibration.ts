'use client';

import { useQuery } from '@apollo/client';
import { SOIL_SENSOR_CONFIGS_QUERY } from '@/graphql/queries/sensor-calibration.queries';

// These operations are hand-typed rather than generated because `npm run
// codegen` needs a running backend. Once the backend is up, running codegen
// will produce equivalent `useSoilSensorConfigsQuery` etc. hooks that can
// replace these; the gql documents already live in src/graphql.
//
// The per-sensor capture state machine that used to live here moved to
// use-cycle-calibration.ts when calibration became cycle-based (it now runs
// N independent captures at once).

export interface SoilSensorConfig {
  id: string;
  device: string;
  greenhouse: string | null;
  greenhouseId: string | null;
  irrigationCycleId: string | null;
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
