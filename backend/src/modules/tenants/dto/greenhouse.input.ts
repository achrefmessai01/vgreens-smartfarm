import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class GreenhouseInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  xDimension: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  yDimension: number;
}
