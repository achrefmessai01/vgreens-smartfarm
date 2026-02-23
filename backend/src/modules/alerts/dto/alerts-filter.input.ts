import {
  IsEnum,
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { AlertSeverity, AlertStatus } from '@common/enums';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AlertsFilterInput {
  @Field({ nullable: true, description: 'Generic search: sensor name, acknowledged by, resolved by, value' })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true, description: 'Filter alerts from this date (timestamp or createdAt)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true, description: 'Filter alerts until this date (timestamp or createdAt)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => AlertStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @Field(() => [AlertStatus], { nullable: true, description: 'Filter by multiple statuses (OR)' })
  @IsOptional()
  @IsEnum(AlertStatus, { each: true })
  statusIn?: AlertStatus[];

  @Field(() => AlertSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @Field(() => [AlertSeverity], { nullable: true, description: 'Filter by multiple severities (OR)' })
  @IsOptional()
  @IsEnum(AlertSeverity, { each: true })
  severityIn?: AlertSeverity[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  acknowledgedById?: string;

  @Field(() => [ID], { nullable: true, description: 'Filter by any of these user IDs (OR)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  acknowledgedByIdIn?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  resolvedById?: string;

  @Field(() => [ID], { nullable: true, description: 'Filter by any of these user IDs (OR)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  resolvedByIdIn?: string[];
}
