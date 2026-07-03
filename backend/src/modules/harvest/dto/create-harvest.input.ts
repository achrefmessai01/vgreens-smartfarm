import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { InputMode } from '@common/enums';
import { HarvestEntryInput } from './harvest-entry.input';

// Wall-clock time-of-day in 24h HH:mm (e.g. "08:30"). Cross-field ordering
// (stopTime after startTime) and the both-or-neither rule are enforced in the
// service, since they depend on the merged harvest state on update.
const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d$/;

// A harvest event belongs to a batch and carries one or more measured entries.
// All measurement totals are derived from the entries by the service.
@InputType()
export class CreateHarvestInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID)
  @IsUUID()
  batchId: string;

  /**
   * How THIS harvest records yield (per-harvest — sibling harvests in the same
   * batch may differ). Defaults to weight. Set at creation; later mode changes
   * go through convertHarvestInputMode so the stored entries are converted
   * alongside the flag.
   */
  @Field(() => InputMode, {
    nullable: true,
    defaultValue: InputMode.WEIGHT,
  })
  @IsOptional()
  @IsEnum(InputMode)
  inputMode?: InputMode;

  /**
   * Selected crate (its weight drives crate-mode kg). Optional here, but the
   * service requires it for crate-mode harvests and ignores it for weight mode.
   */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  crateId?: string | null;

  @Field({ description: 'Harvest date (ISO date string)' })
  @IsDateString()
  date: string;

  @Field(() => String, {
    nullable: true,
    description: 'Harvest start time, wall-clock HH:mm (local zone)',
  })
  @IsOptional()
  @Matches(TIME_OF_DAY, { message: 'startTime must be in HH:mm format' })
  startTime?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Harvest stop time, wall-clock HH:mm (local zone)',
  })
  @IsOptional()
  @Matches(TIME_OF_DAY, { message: 'stopTime must be in HH:mm format' })
  stopTime?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of harvesters for the session (positive integer)',
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'harvesterHeadCount must be a positive integer' })
  harvesterHeadCount?: number | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @Field(() => [HarvestEntryInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HarvestEntryInput)
  entries?: HarvestEntryInput[];
}
