import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsInt, IsObject, IsIP, MaxLength, Min, Max } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ErrorSource, ErrorType, ReportSeverity } from '@common/enums';

@InputType()
export class CreateSystemErrorInput {
  @Field(() => ErrorSource)
  @IsEnum(ErrorSource)
  source: ErrorSource;

  @Field(() => ErrorType)
  @IsEnum(ErrorType)
  errorType: ErrorType;

  @Field(() => ReportSeverity)
  @IsEnum(ReportSeverity)
  severity: ReportSeverity;

  @Field()
  @IsString()
  @MaxLength(500)
  errorMessage: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stackTrace?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  requestUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  httpMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  httpStatusCode?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  userAgent?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  component?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  action?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  requestPayload?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;
}