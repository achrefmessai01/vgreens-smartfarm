import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';

@InputType()
export class ToggleTenantFeatureInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  featureId: string;

  @Field()
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
