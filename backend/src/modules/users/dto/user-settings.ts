import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { HarvestSortField, OrderDirection } from '@common/enums';

// Typed shape of the freeform `users.userSettings` jsonb blob. Today it only
// carries the harvest-entry view preferences; future features add sibling keys
// under UserSettings and must be MERGED in (see mergeUserSettings), never
// overwrite the whole object.

@ObjectType()
export class HarvestViewSort {
  @Field(() => HarvestSortField)
  field: HarvestSortField;

  @Field(() => OrderDirection)
  direction: OrderDirection;
}

@ObjectType()
export class HarvestViewDateRange {
  // Inclusive plantingDate bounds as YYYY-MM-DD strings. null = open-ended.
  @Field({ nullable: true })
  from?: string | null;

  @Field({ nullable: true })
  to?: string | null;
}

@ObjectType()
export class HarvestViewSettings {
  @Field(() => HarvestViewSort, { nullable: true })
  sort?: HarvestViewSort | null;

  @Field(() => HarvestViewDateRange, { nullable: true })
  dateRange?: HarvestViewDateRange | null;
}

@ObjectType()
export class UserSettings {
  @Field(() => HarvestViewSettings, { nullable: true })
  harvestView?: HarvestViewSettings | null;
}

// ---- Input mirrors (structurally validated by class-validator) ----

@InputType()
export class HarvestViewSortInput {
  @Field(() => HarvestSortField)
  @IsEnum(HarvestSortField)
  field: HarvestSortField;

  @Field(() => OrderDirection)
  @IsEnum(OrderDirection)
  direction: OrderDirection;
}

@InputType()
export class HarvestViewDateRangeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string | null;
}

@InputType()
export class HarvestViewSettingsInput {
  @Field(() => HarvestViewSortInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestViewSortInput)
  sort?: HarvestViewSortInput | null;

  @Field(() => HarvestViewDateRangeInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestViewDateRangeInput)
  dateRange?: HarvestViewDateRangeInput | null;
}
