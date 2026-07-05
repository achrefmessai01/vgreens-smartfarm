import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

// Edits an existing variety's display fields. cropId + tenantId are FIXED at
// create-time to keep the (tenantId, cropId, name) unique invariant simple —
// if a user picked the wrong crop, they should delete and recreate under the
// right crop rather than mutate the FK. Uniqueness (tenantId, cropId, name)
// still applies on rename.
@InputType()
export class UpdateVarietyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
