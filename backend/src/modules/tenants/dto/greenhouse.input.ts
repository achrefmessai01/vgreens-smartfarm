import { DoorPosition } from '@/common/enums/door-position.enum';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class GreenhouseInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => DoorPosition, { nullable: true })
  @IsOptional()
  @IsEnum(DoorPosition)
  doorPosition?: DoorPosition;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  xDimension: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  yDimension: number;
}
