import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FeatureWithTenantStatus {
  @Field(() => String)
  id: string;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  enabledForTenant?: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
