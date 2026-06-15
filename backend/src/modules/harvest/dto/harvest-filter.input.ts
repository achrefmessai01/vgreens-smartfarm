import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';
import { BatchStatus } from '@common/enums';

// Harvest list filters. Planting/identity fields (search term, status,
// greenhouse) now live on the parent batch and are filtered via a join.
@InputType()
export class HarvestFilterInput {
  @Field({ nullable: true, description: 'Search in batch name / species / variety' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true, description: 'Harvests from this date (inclusive)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true, description: 'Harvests until this date (inclusive)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => BatchStatus, {
    nullable: true,
    description: 'Filter by the parent batch status',
  })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @Field(() => ID, {
    nullable: true,
    description: 'Filter by tenant (VGreens admin only)',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by user who created' })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by batch' })
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by greenhouse' })
  @IsOptional()
  @IsUUID()
  greenhouseId?: string;
}
