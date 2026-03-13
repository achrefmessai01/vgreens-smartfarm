import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class CreateImageUploadInput {
  @Field({ description: 'Original filename including extension' })
  @IsString()
  filename: string;

  @Field({
    nullable: true,
    description:
      'Logical folder under the tenant, e.g. "harvest" or "avatars". Defaults to "images".',
  })
  @IsOptional()
  @IsString()
  folder?: string | null;

  @Field(() => ID, {
    nullable: true,
    description:
      'Optional tenant override. Only honoured for vGreens admins; for others the tenant is taken from the current user.',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string | null;

  @Field(() => Int, {
    nullable: true,
    description:
      'Signed upload URL validity in seconds (default: 600, max: 3600).',
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  expiresIn?: number | null;
}
