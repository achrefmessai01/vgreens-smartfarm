import type { Bay } from '@/types/farm.types';

export interface ParGraphSectionProps {
  bay: Bay | null;
  greenhouseId: string;
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
  avg: number;
  yesterday: number;
  today: number | null;
  lowerBand: number;
  band: number;
}

export interface ParGraphData {
  curveData: ParCurvePoint[];
  currentHour: number;
  currentDli: number;
  currentPpfd: number | null;
  timeLabel: string;
  yMax: number;
}
