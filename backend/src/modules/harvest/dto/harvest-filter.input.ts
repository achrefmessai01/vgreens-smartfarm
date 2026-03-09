import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';

@InputType()
export class HarvestFilterInput {
  @Field({ nullable: true, description: 'Search in batch / species / variety' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true, description: 'Harvests from this date (inclusive)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({
    nullable: true,
    description: 'Harvests until this date (inclusive)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => HarvestStatus, {
    nullable: true,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(HarvestStatus)
  status?: HarvestStatus;

  @Field(() => ID, {
    nullable: true,
    description: 'Filter by tenant (VGreens admin only)',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Filter by user who created',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @Field({ nullable: true, description: 'Filter by greenhouse' })
  @IsOptional()
  @IsString()
  greenhouse?: string;
}
