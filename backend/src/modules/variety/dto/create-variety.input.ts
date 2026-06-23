import {
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

// Used to add a new variety from the Batch Form's Variety dropdown. A variety is
// global reference data but always tied to a specific crop (cascading
// crop → variety relationship).
@InputType()
export class CreateVarietyInput {
  @Field(() => ID)
  @IsUUID()
  cropId: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
