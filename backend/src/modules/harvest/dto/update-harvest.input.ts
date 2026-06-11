import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, ID } from '@nestjs/graphql';
import { HarvestEntryInput } from './harvest-entry.input';

// On update, only provided fields change. When `entries` is provided it fully
// replaces the harvest's stored entries (the service deletes the old rows and
// inserts the new set).
@InputType()
export class UpdateHarvestInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;

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
