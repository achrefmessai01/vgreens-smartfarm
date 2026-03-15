import { registerEnumType } from '@nestjs/graphql';

export enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
}

registerEnumType(ReportSeverity, {
  name: 'ReportSeverity',
  description: 'Error report severity levels',
});