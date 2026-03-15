import { registerEnumType } from '@nestjs/graphql';

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

registerEnumType(ReportSeverity, {
  name: 'ReportSeverity',
  description: 'Error report severity levels',
});