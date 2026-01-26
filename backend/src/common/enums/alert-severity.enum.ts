import { registerEnumType } from '@nestjs/graphql';

export enum AlertSeverity {
  CRITICAL = 'critical',
}

registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Alert severity levels',
});
