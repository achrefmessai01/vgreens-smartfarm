import { AlertStatus } from '@common/enums';
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';

@InputType()
export class UpdateAlertInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sensorName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  value?: string;

  @Field(() => AlertStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

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
