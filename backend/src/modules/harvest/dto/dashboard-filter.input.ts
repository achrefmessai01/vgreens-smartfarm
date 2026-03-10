import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsDateString, IsString, IsUUID } from 'class-validator';

@InputType()
export class DashboardFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field({ nullable: true, description: 'Filter by species' })
  @IsOptional()
  @IsString()
  species?: string;

  @Field({ nullable: true, description: 'Filter by variety' })
  @IsOptional()
  @IsString()
  variety?: string;

  @Field({ nullable: true, description: 'Filter by batch name' })
  @IsOptional()
  @IsString()
  batch?: string;

  @Field({ nullable: true, description: 'Start date for dashboard data (ISO date string)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true, description: 'End date for dashboard data (ISO date string)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field({ nullable: true, description: 'Filter by greenhouse' })
  @IsOptional()
  @IsString()
  greenhouse?: string;
}