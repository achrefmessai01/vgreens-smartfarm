import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
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
}
