import { IsEnum, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { HarvestSortField, OrderDirection } from '@common/enums';

// One active sort at a time: a single field + direction. Defaults to
// PLANTING_DATE / DESC when omitted (preserves the previous hardcoded order).
@InputType()
export class BatchSortInput {
  @Field(() => HarvestSortField, {
    nullable: true,
    description: 'Field to sort by (default PLANTING_DATE)',
  })
  @IsOptional()
  @IsEnum(HarvestSortField)
  field?: HarvestSortField;

  @Field(() => OrderDirection, {
    nullable: true,
    description: 'Sort direction (default DESC)',
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  direction?: OrderDirection;
}
