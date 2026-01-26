import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class WriteDataInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  measurement: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tunnelId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sensorName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sensorType?: string;
}
