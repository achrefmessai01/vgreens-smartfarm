import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import {
  HarvestSortField,
  OrderDirection,
  HarvestDateRangePreset,
} from '@common/enums';

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
export class HarvestViewSettings {
  @Field(() => HarvestViewSort, { nullable: true })
  sort?: HarvestViewSort | null;

  // Relative plantingDate range preset (resolved to dates client-side).
  @Field(() => HarvestDateRangePreset, { nullable: true })
  range?: HarvestDateRangePreset | null;

  // Batch IDs the user has collapsed in the harvest-entry list. Batches are
  // expanded by default; only the collapsed ones are tracked here. Absent/null
  // means "nothing collapsed".
  @Field(() => [String], { nullable: true })
  collapsedBatchIds?: string[] | null;
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
export class HarvestViewSettingsInput {
  @Field(() => HarvestViewSortInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => HarvestViewSortInput)
  sort?: HarvestViewSortInput | null;

  @Field(() => HarvestDateRangePreset, { nullable: true })
  @IsOptional()
  @IsEnum(HarvestDateRangePreset)
  range?: HarvestDateRangePreset | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collapsedBatchIds?: string[] | null;
}
