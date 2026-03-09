import { registerEnumType } from '@nestjs/graphql';

export enum HarvestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
}

registerEnumType(HarvestStatus, {
  name: 'HarvestStatus',
  description: 'Harvest batch lifecycle status',
});
