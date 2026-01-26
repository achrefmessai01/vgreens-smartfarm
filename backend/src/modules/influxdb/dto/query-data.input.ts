import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class QueryDataInput {
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
  @IsString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  limit?: string;
}
