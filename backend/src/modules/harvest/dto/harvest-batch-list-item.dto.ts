import { ObjectType, Field, ID } from '@nestjs/graphql';
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
}
