import { IsOptional, IsDateString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

// Filters for the batch-grouped harvest list. The date range filters on the
// batch's plantingDate (NOT the harvest event date), and both bounds are
// inclusive: plantingDateFrom <= plantingDate <= plantingDateTo.
@InputType()
export class BatchFilterInput {
  @Field({
    nullable: true,
    description:
      'Batches planted on or after this date (inclusive, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  plantingDateFrom?: string;

  @Field({
    nullable: true,
    description:
      'Batches planted on or before this date (inclusive, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  plantingDateTo?: string;
}
