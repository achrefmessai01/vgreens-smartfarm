import {
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { BrixReading } from '../entities/brix-reading';

// Input shape for a single measured position. avgFruitWeight and avgBrix are NOT
// accepted — the service derives them on write. id is optional so an update can
// keep/replace specific entries.
@InputType()
export class HarvestEntryInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  id?: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowX?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowY?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  classA?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  classB?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  classC?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waste?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fruitCount?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalFruitWeight?: number;

  @Field(() => [BrixReading], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrixReading)
  brixReadings?: BrixReading[];
}
