import { IsNumber, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';

// Input shape for a single harvest sub-entry. Mirrors HarvestEntry; all numeric
// fields default to 0 so a sparsely-filled entry still validates.
@InputType()
export class HarvestEntryInput {
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
  waste?: number;

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
  avgBrix?: number;

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  brixReadings?: number[];

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

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgFruitWeight?: number;
}
