import { Field, Float, ID, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@InputType()
export class UpsertSensorConfigInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  device: string;

  // Usually omitted by clients — the resolver fills it from the device's
  // InfluxDB `profile` tag when neither input nor the stored row has one.
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  profile?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  xPosition?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  yPosition?: number;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  greenhouseId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  hiddenInFarmOverview?: boolean;
}
