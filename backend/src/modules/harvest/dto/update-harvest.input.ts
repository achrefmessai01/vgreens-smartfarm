import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { HarvestEntryInput } from './harvest-entry.input';

// Wall-clock time-of-day in 24h HH:mm. Passing null clears the stored value;
// the service re-validates ordering / both-or-neither against the merged state.
const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d$/;

// On update, only provided fields change. When `entries` is provided it fully
// replaces the harvest's stored entries (the service deletes the old rows and
// inserts the new set).
@InputType()
export class UpdateHarvestInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  // Reassign the harvest's crate. Only provided fields change; when omitted the
  // stored crate is kept. The service re-validates the crate-mode requirement
  // against the resulting (merged) state.
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  crateId?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(TIME_OF_DAY, { message: 'startTime must be in HH:mm format' })
  startTime?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(TIME_OF_DAY, { message: 'stopTime must be in HH:mm format' })
  stopTime?: string | null;

  @Field(() => Int, { nullable: true })
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
