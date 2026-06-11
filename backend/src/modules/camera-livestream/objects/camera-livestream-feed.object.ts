import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CameraLivestreamFeed {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  path: string;

  @Field({ nullable: true })
  snapshotUrl?: string | null;

  @Field({ nullable: true })
  updatedAt?: Date | null;

  @Field({ nullable: true })
  expiresAt?: Date | null;

  @Field()
  available: boolean;

  @Field({ nullable: true })
  error?: string | null;
}
