import { registerEnumType } from '@nestjs/graphql';

// Maps to the Postgres `batches_status_enum` type. Replaces the old
// HarvestStatus lifecycle (which also had draft/inactive) now that batch
// lifecycle is tracked on the batches table.
export enum BatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

registerEnumType(BatchStatus, {
  name: 'BatchStatus',
  description: 'Batch lifecycle status',
});
