import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class ListImagesInput {
  @Field({
    nullable: true,
    description:
      'Folder under the tenant prefix to list, e.g. "harvest". Defaults to listing all images for the tenant.',
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
    description: 'Maximum number of results to return (default: 50, max: 200).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to skip (offset-based pagination).',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number | null;
}
