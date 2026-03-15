import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ReportSeverity, ReportStatus } from '@common/enums';
import { OrderDirection } from '@common/enums';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ErrorReportsFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => ReportSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(ReportSeverity)
  severity?: ReportSeverity;

  @Field(() => ReportStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @Field(() => OrderDirection, { nullable: true })
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}