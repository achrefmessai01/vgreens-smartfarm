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
import { BatchStatus, InputMode } from '@common/enums';

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

  // Required FK into the global crops catalog. Must be a crop assigned to the
  // batch's greenhouse (validated in the service).
  @Field(() => ID)
  @IsUUID()
  cropId: string;

  // Optional FK into the global varieties catalog. When given, must belong to
  // the selected crop (validated in the service).
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  varietyId?: string;

  @Field({
    nullable: true,
    description: 'Defaults to "crop - variety" if omitted',
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

  // Yield input mode, fixed at creation. Crate mode requires a positive
  // crateWeight (enforced in the service).
  @Field(() => InputMode, {
    nullable: true,
    defaultValue: InputMode.WEIGHT,
  })
  @IsOptional()
  @IsEnum(InputMode)
  inputMode?: InputMode;

  // Weight of one crate (kg). Required and must be > 0 when inputMode is crate;
  // ignored (left null) for weight mode.
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  crateWeight?: number;

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

  // Start/end row of the contiguous block this batch occupies (inclusive).
  // Both optional (backfilled by hand for legacy batches); when both are given
  // the service enforces startRow <= endRow. Positive row numbers only.
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  startRow?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  endRow?: number;

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

  // How many replicate input sets the harvest form should render. At least 1.
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  replicates?: number;

  // Average number of heads per plant. Tomato-only metadata; never required, so
  // it stays nullable and carries no default.
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  avgHeadsPerPlant?: number;

  // Length of a slab (cm). Tomato-only metadata; never required, so it stays
  // nullable and carries no default.
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  slabLength?: number;

  // Number of heads per slab. Tomato-only metadata; never required, so it stays
  // nullable and carries no default.
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  headsPerSlab?: number;
}
