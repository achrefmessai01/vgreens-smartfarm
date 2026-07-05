import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Only the name is editable. Moving a cycle to another greenhouse would break
// the same-greenhouse invariant of its assigned sensors — delete and recreate
// instead.
@InputType()
export class UpdateIrrigationCycleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name?: string;
}
