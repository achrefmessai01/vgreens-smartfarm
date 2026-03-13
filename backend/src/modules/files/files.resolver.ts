import {
  ListImagesInput,
  DeleteImageInput,
  CreateImageUploadInput,
  GetSignedImageUrlInput,
  UploadImageInput,
} from './dto';
import { UserRole } from '@common/enums';
import { FilesService } from './files.service';
import { ImageFile, SignedUrl } from './objects';
import { RolesGuard } from '@common/guards/roles.guard';
import { User } from '@modules/users/entities/user.entity';
import { Roles } from '@common/decorators/roles.decorator';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard } from '@common/guards/clerk-auth.guard';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import type { FileUpload } from 'graphql-upload-ts';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver()
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  @Mutation(() => ImageFile, {
    name: 'uploadImage',
    description:
      'Upload an image file directly via GraphQL and store it in Supabase Storage.',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  uploadImage(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => UploadImageInput }) input: UploadImageInput,
  ): Promise<ImageFile> {
    if (!input.file) {
      throw new Error('File is required');
    }
    const file: FileUpload = input.file;
    const { folder, tenantId } = input;
    return this.filesService.uploadImageFromStream(
      currentUser,
      file,
      folder,
      tenantId,
    );
  }

  @Mutation(() => SignedUrl, {
    name: 'createImageUploadUrl',
    description:
      'Create a signed URL that allows the client to upload an image directly to Supabase Storage.',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  createImageUploadUrl(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => CreateImageUploadInput })
    input: CreateImageUploadInput,
  ): Promise<SignedUrl> {
    return this.filesService.createImageUploadUrl(currentUser, input);
  }

  @Query(() => [ImageFile], {
    name: 'images',
    description:
      'List images stored for the current tenant (or a specific tenant for admins).',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  listImages(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => ListImagesInput, nullable: true })
    input?: ListImagesInput,
  ): Promise<ImageFile[]> {
    return this.filesService.listImages(currentUser, input ?? {});
  }

  @Mutation(() => Boolean, {
    name: 'deleteImage',
    description:
      'Delete an image from Supabase Storage. Non-admins can only delete their tenant images.',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  deleteImage(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => DeleteImageInput }) input: DeleteImageInput,
  ): Promise<boolean> {
    return this.filesService.deleteImage(currentUser, input);
  }

  @Query(() => SignedUrl, {
    name: 'signedImageUrl',
    description:
      'Create a time-limited signed URL for viewing or downloading a private image.',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  getSignedImageUrl(
    @CurrentUser() currentUser: User,
    @Args('input', { type: () => GetSignedImageUrlInput })
    input: GetSignedImageUrlInput,
  ): Promise<SignedUrl> {
    return this.filesService.getSignedImageUrl(currentUser, input);
  }
}
