export type TunnelStatus = 'normal' | 'warning' | 'critical';

export interface EnvironmentData {
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
}

export interface IrrigationData {
  soilEC: number;
  soilMoisture: number;
  pH: number;
  waterEC: number;
  lastIrrigation: string;
}

export interface Tunnel {
  id: string;
  name: string;
  number: number;
  environment: EnvironmentData;
  irrigation: IrrigationData;
  status: TunnelStatus;
  hasWarning: boolean;
  hasAlert: boolean;
  warningCount: number;
  alertCount: number;
}
