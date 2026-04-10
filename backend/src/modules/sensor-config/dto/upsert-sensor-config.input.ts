import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class UpsertSensorConfigInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  device: string;

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

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  greenhouse?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;
}
