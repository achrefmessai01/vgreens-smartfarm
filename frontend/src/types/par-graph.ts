import type { Bay } from '@/types/farm.types';

export interface ParGraphSectionProps {
  bay: Bay | null;
  greenhouseLabel: string;
  /**
   * Optional tenant override. Required when the viewer is a vGreens admin
   * targeting another tenant; tenant users can leave this undefined and
   * the backend resolves the tenant from their auth context.
   */
  tenantId?: string | null;
  /**
   * Greenhouse name to slice the tenant PAR/DLI response by. Must match
   * one of the names returned in `TenantParDli.greenhouses[].name` (which
   * mirror `tenants.greenhouses[].name`). Leave undefined/null to render
   * the combined view. For tenants without a sensor→greenhouse mapping
   * the hook falls back to combined regardless.
   */
  greenhouseName?: string | null;
  embedded?: boolean;
  className?: string;
}

export interface ParCurvePoint {
  hour: number;
  today: number;
}

/**
 * One point on the historical DLI envelope. `dli` is `null` for hours
 * that have no samples on any of the lookback days — Recharts renders
 * those as gaps rather than dropping to zero.
 */
export interface ParBandPoint {
  hour: number;
  dli: number | null;
}

export interface ParGraphData {
  curveData: ParCurvePoint[];
  lowerEdge: ParBandPoint[];
  upperEdge: ParBandPoint[];
  currentHour: number;
  currentDli: number;
  currentPpfd: number | null;
  timeLabel: string;
  yMax: number;
}
