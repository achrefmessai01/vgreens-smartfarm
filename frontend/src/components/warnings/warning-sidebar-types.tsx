export interface SensorData {
  sensorName?: string;
  value: string;
  timestamp?: string;
  tunnel?: string;
  status?: string;
}

export interface BaseFieldProps {
  isLoading?: boolean;
}

export interface SensorNameFieldProps extends BaseFieldProps {
  sensorName: string;
}

export interface ValueFieldProps extends BaseFieldProps {
  value: string;
}

export interface TimeStampFieldProps extends BaseFieldProps {
  timestamp: string;
}

export interface TunnelFieldProps extends BaseFieldProps {
  tunnel: string;
}

export interface StatusFieldProps extends BaseFieldProps {
  status: string;
}
