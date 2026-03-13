import { IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteImageInput {
  @Field({
    description:
      'Full storage path of the image relative to the bucket (including tenant prefix).',
  })
  @IsString()
  path: string;
}
