import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CreateIrrigationCycleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  // The greenhouse this cycle irrigates. Required: the same-greenhouse rule
  // for sensor assignment needs every cycle anchored to a greenhouse.
  @Field(() => ID)
  @IsUUID()
  greenhouseId: string;
}
