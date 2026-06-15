import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CameraLivestreamStream {
  @Field()
  cameraId: string;

  @Field({ nullable: true })
  url?: string | null;

  @Field({ nullable: true })
  expiresAt?: Date | null;

  @Field()
  available: boolean;

  @Field({ nullable: true })
  error?: string | null;
}
