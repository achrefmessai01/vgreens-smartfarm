import { IsUUID } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

// One harvest's crate choice for a weight -> crate conversion. The switch is
// batch-wide but each harvest picks its own crate, so the mutation takes one of
// these per harvest in the batch.
@InputType()
export class HarvestCrateAssignmentInput {
  @Field(() => ID)
  @IsUUID()
  harvestId: string;

  @Field(() => ID)
  @IsUUID()
  crateId: string;
}
