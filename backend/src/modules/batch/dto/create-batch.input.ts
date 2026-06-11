import {
  IsUUID,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { BatchStatus } from '@common/enums';

@InputType()
export class CreateBatchInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  greenhouseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  species?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  variety?: string;

  @Field({
    nullable: true,
    description: 'Defaults to "species - variety" if omitted',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => BatchStatus, {
    nullable: true,
    defaultValue: BatchStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @Field({ description: 'Planting date (ISO date string)' })
  @IsDateString()
  plantingDate: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfRows?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowLength?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rowSpacing?: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plantsPerMeter?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lostPlants?: number;

  // Optional override; the service derives it from rows/length when omitted.
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cultivationArea?: number;

  // Optional override; the service derives it from area/density when omitted.
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalPlants?: number;
}
