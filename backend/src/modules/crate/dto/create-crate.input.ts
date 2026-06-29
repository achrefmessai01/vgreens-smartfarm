import { IsNumber, Min } from 'class-validator';
import { InputType, Field, Float } from '@nestjs/graphql';

/**
 * Input for adding a crate from the harvest sidebar's crate dropdown. The
 * resolver stamps tenantId/createdById from the caller, so the client only
 * supplies the weight (kg, must be > 0).
 */
@InputType()
export class CreateCrateInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0.0001)
  weight: number;
}
