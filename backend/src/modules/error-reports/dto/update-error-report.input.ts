import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ReportSeverity, ReportStatus } from '@common/enums';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateErrorReportInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  errorTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  errorDetails?: string;

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
  @IsString()
  reproductionSteps?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  expectedVsActual?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  browserInfo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;
}