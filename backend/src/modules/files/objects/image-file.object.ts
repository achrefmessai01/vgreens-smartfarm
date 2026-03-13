import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImageFile {
  @Field({
    description:
      'Full storage path of the image relative to the bucket (including tenant prefix).',
  })
  path: string;

  @Field({ description: 'Filename of the image.' })
  filename: string;

  @Field({ description: 'Bucket in which the image is stored.' })
  bucket: string;

  @Field({ nullable: true, description: 'MIME type as reported by Supabase.' })
  mimeType?: string | null;

  @Field({ nullable: true, description: 'Size of the image in bytes.' })
  size?: number | null;

  @Field({
    nullable: true,
    description: 'Timestamp when the image was created in storage.',
  })
  createdAt?: Date | null;

  @Field({
    nullable: true,
    description: 'Timestamp when the image was last updated.',
  })
  updatedAt?: Date | null;

  @Field({
    nullable: true,
    description:
      'Time-limited URL that can be used to view the image. Only populated when returned from listImages.',
  })
  url?: string | null;
}
