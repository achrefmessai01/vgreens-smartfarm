import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpsertSensorConfigInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  device: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bay?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  pole?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  row?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  greenhouse?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;
}
