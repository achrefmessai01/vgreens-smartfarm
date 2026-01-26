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
}
