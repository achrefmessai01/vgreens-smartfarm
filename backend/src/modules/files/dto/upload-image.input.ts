import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDefined, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UploadImageInput {
  @Field({
    nullable: true,
    description: 'Logical folder, e.g. "harvest" or "avatars".',
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

  @Field(() => GraphQLUpload, {
    description: 'Image file to upload.',
  })
  @IsDefined()
  file!: FileUpload;
}
