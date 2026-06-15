import {
  IsUUID,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { DoorPosition } from '@common/enums';

@InputType()
export class CreateGreenhouseInput {
  // VGREENS_ADMIN may target a tenant explicitly; tenant users inherit their own.
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => DoorPosition, { nullable: true })
  @IsOptional()
  @IsEnum(DoorPosition)
  doorPosition?: DoorPosition;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  xDimension?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yDimension?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  bayCount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isHorizontal?: boolean;
}
