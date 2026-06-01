import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';

@ObjectType()
export class HarvestBatchListItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  species: string;

  @Field()
  variety: string;

  @Field({ nullable: true })
  greenhouse?: string;

  @Field()
  plantingDate: Date;

  @Field(() => HarvestStatus)
  status: HarvestStatus;

  @Field(() => Float, {
    nullable: true,
    description:
      'kg per plant for this batch: (Σ classA + classB across batch rows) / totalPlants. Null when totalPlants is 0 or missing.',
  })
  yieldPerPlant: number | null;
}
