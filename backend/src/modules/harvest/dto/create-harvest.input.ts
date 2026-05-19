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
import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';

@InputType()
export class CreateHarvestInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentBatchId?: string;

  // --- Batch creation fields (dialog) ---

  @Field()
  @IsString()
  species: string;

  @Field()
  @IsString()
  variety: string;

  @Field({
    nullable: true,
    description: 'Defaults to "species - variety" if omitted',
  })
  @IsOptional()
  @IsString()
  batch?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  greenhouse?: string;

  @Field({ description: 'Planting date (ISO date string)' })
  @IsDateString()
  plantingDate: string;

  @Field(() => Float, { description: 'Cultivation area in m²' })
  @IsNumber()
  @Min(0)
  cultivationArea: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  numberOfRows: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  rowLength: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  plantsPerMeter: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowSpacing?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalPlants?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lostPlants?: number;

  @Field(() => HarvestStatus, {
    nullable: true,
    defaultValue: HarvestStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(HarvestStatus)
  status?: HarvestStatus;

  // --- Harvest log fields (sidebar) ---

  @Field({ description: 'Harvest date (ISO date string)' })
  @IsDateString()
  date: string;

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
  avgBrix?: number;

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

  @Field(() => Float, {
    defaultValue: 0,
    deprecationReason: 'Use rowX and rowY instead.',
  })
  @IsOptional()
  @IsNumber()
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

  @Field(() => Int, { defaultValue: 0 })
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
