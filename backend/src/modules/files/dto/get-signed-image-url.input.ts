import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class GetSignedImageUrlInput {
  @Field({
    description:
      'Full storage path of the image relative to the bucket (including tenant prefix).',
  })
  @IsString()
  path: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Signed URL validity in seconds (default: 600, max: 3600).',
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  expiresIn?: number | null;
}
