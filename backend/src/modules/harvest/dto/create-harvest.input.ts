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

  @Field({ description: 'Harvest date (ISO date string)' })
  @IsDateString()
  date: string;

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
