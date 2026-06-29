import { IsNumber, Min } from 'class-validator';
import { InputType, Field, Float } from '@nestjs/graphql';

// Used to add a new crate from the harvest sidebar's crate dropdown. A crate is
// tenant-scoped, but the resolver stamps tenantId/createdById from the caller —
// the client only supplies the weight.
@InputType()
export class CreateCrateInput {
  // Weight of one full crate in kilograms; must be > 0 (mirrors the old
  // batch.crateWeight @Min(0.0001) rule).
  @Field(() => Float)
  @IsNumber()
  @Min(0.0001)
  weight: number;
}
