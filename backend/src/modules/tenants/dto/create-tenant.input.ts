import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTenantInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Email-domain whitelist for this tenant. Empty/omitted = any domain allowed.
  // Bare domains only ("v-greens.com"); the service normalizes to lowercase and
  // strips leading "@" or scheme noise before persisting.
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];
}
