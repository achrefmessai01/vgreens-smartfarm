import { registerEnumType } from '@nestjs/graphql';

export enum AlertStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

registerEnumType(AlertStatus, {
  name: 'AlertStatus',
  description: 'Alert status types',
});
