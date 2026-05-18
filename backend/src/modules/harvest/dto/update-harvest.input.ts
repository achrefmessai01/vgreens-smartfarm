import {
  IsUUID,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';

@InputType()
export class UpdateHarvestInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentBatchId?: string;

  // --- Batch fields ---

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  species?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  variety?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  batch?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  greenhouse?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cultivationArea?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  numberOfRows?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  rowLength?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  plantsPerMeter?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowSpacing?: number;

  @Field(() => HarvestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(HarvestStatus)
  status?: HarvestStatus;

  // --- Harvest log fields ---

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  classA?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  classB?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waste?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgBrix?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  rowX?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  rowY?: number;

  @Field(() => Int, {
    nullable: true,
    deprecationReason: 'Use rowX and rowY instead.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfRowsHarvested?: number;

  // --- Brix measurements ---

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  brixReadings?: number[];

  // --- Photos ---

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  photos?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
