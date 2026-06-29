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

  // Parallel arrays of harvested row segments: rowX[i] pairs with rowY[i] to
  // span segment i. Both optional (omitted -> []); the service enforces equal
  // length and rowX[i] <= rowY[i]. Positive row numbers only.
  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  rowX?: number[];

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  rowY?: number[];

  // Weight mode: positional per-quality sellable kg (index 0=A, 1=B, ...).
  // Dynamic length, not capped. Omitted in crate mode.
  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  classKgs?: number[];

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waste?: number;

  // Crate mode only: positional per-quality arrays of crate counts and
  // remaining-kg tails. Index maps to a quality class by position (0=A, 1=B,
  // 2=C, 3=D, ...) — count is dynamic, not capped. Omitted in weight mode. The
  // service derives kg/total from the batch crateWeight; totalFruitWeight is not
  // accepted for crate entries.
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  crateCounts?: number[];

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  remainingKgs?: number[];

  // Sample-based fruit weight. The user weighs a small counted sample rather
  // than every fruit: sampleWeight is the sample's mass in GRAMS, sampleFruitCount
  // the number of fruits in it. The service derives avgFruitWeight (g/fruit) from
  // these. Both optional — omitted when no sample was taken for this entry.
  // (fruitCount/totalFruitWeight are no longer accepted; they were the old
  // count-everything method and are derived/legacy now.)
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sampleWeight?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sampleFruitCount?: number | null;

  @Field(() => [BrixReading], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrixReading)
  brixReadings?: BrixReading[];
}
