import {
  IsEnum,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
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
}
