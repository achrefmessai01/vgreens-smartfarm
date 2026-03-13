import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignedUrl {
  @Field({
    description:
      'Full storage path of the image relative to the bucket (including tenant prefix).',
  })
  path: string;

  @Field({
    description:
      'Time-limited URL that can be used to upload or download the image.',
  })
  url: string;

  @Field({
    nullable: true,
    description: 'Timestamp at which the signed URL expires.',
  })
  expiresAt?: Date | null;
}
