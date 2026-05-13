import type { Bay } from '@/types/farm.types';

export interface ParGraphSectionProps {
  bay: Bay | null;
  greenhouseLabel: string;
  /**
   * Optional InfluxDB bucket override. Required when the viewer is a vGreens
   * admin viewing another tenant — `me.tenant.influxBucketName` is only set
   * for tenant users, so without this override the PAR query is silently
   * skipped on the admin side.
   */
  bucketName?: string | null;
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
