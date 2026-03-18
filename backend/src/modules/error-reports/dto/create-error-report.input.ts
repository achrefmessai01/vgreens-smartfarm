import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
} from 'class-validator';
import { ReportSeverity } from '@common/enums';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateErrorReportInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  errorTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  errorDetails: string;

  @Field(() => ReportSeverity)
  @IsEnum(ReportSeverity)
  severity: ReportSeverity;

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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}