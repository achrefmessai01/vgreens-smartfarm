import {
  IsEnum,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { AlertSeverity } from '@common/enums';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateAlertInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tunnelId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  sensorName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  value: string;

  @Field(() => AlertSeverity, { nullable: true })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ruleKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  field?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  measurement?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  device?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  greenhouse?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  column?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  row?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profile?: string;
}
