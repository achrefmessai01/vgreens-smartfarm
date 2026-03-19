export type WarningStatus = 'open' | 'acknowledged' | 'resolved';

export interface Warning {
  id: string;
  sensorName: string;
  value: string;
  timestamp: string;
  tunnel: string;
  status: WarningStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Alert extends Warning {
  severity: 'critical';
}

export interface WarningFormData {
  status: WarningStatus;
}
