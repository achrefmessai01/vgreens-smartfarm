export interface BaseFieldProps {
  isLoading?: boolean
}

export interface SensorNameFieldProps extends BaseFieldProps {
  sensorName: string
}

export interface ValueFieldProps extends BaseFieldProps {
  value: string
}

export interface StatusFieldProps extends BaseFieldProps {
  status: string
}

export interface SeverityFieldProps extends BaseFieldProps {
  severity: string
}

export interface TimeStampFieldProps extends BaseFieldProps {
  timestamp: string
}

export interface DescriptionFieldProps extends BaseFieldProps {
  description: string
}

export interface AcknowledgedByFieldProps extends BaseFieldProps {
  acknowledgedBy: string
}

export interface ResolvedByFieldProps extends BaseFieldProps {
  resolvedBy: string
}
