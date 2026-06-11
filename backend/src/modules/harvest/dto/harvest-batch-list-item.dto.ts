import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { BatchStatus } from '@common/enums';

// Lightweight batch summary for the harvest batch selector. Sourced from the
// batches table; yieldPerPlant is derived from the batch's harvest entries.
@ObjectType()
export class HarvestBatchListItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  species?: string;

  @Field({ nullable: true })
  variety?: string;

  @Field({ nullable: true })
  greenhouse?: string;

  @Field()
  plantingDate: Date;

  @Field(() => BatchStatus)
  status: BatchStatus;

  @Field(() => Float, {
    nullable: true,
    description:
      'kg per plant for this batch: Σ(totalFruitWeight across the batch entries) / totalPlants. Null when totalPlants is 0 or missing.',
  })
  yieldPerPlant: number | null;
}
