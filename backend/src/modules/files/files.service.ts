import {
  ListImagesInput,
  DeleteImageInput,
  CreateImageUploadInput,
  GetSignedImageUrlInput,
} from './dto';
import {
  Logger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@common/enums';
import { ConfigService } from '@nestjs/config';
import { ImageFile, SignedUrl } from './objects';
import { User } from '@modules/users/entities/user.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { FileUpload } from 'graphql-upload-ts';

interface SupabaseFileObject {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly supabase: SupabaseClient<any, any, any, any, any>;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!url || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured',
      );
    }

    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ??
      'vgreens-files';

    // Base URL for publicly accessible objects in this bucket
    this.publicBaseUrl = `${url}/storage/v1/object/public/${this.bucket}`;

    this.supabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async createImageUploadUrl(
    currentUser: User,
    input: CreateImageUploadInput,
  ): Promise<SignedUrl> {
    const tenantId = this.resolveTenantId(currentUser, input.tenantId);
    const folder = input.folder?.trim() || 'images';
    const sanitizedFilename = this.sanitizeFilename(input.filename);
    const uniqueName = `${uuidv4()}-${sanitizedFilename}`;
    const basePath = this.buildTenantPrefix(tenantId, folder);
    const path = `${basePath}/${uniqueName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to create signed upload URL: ${error?.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to create image upload URL',
      );
    }

    return {
      path,
      url: data.signedUrl,
      // Supabase does not currently expose the exact expiry for signed upload URLs,
      // so we return null here. The client should upload immediately after receiving the URL.
      expiresAt: null,
    };
  }

  async listImages(
    currentUser: User,
    input: ListImagesInput,
  ): Promise<ImageFile[]> {
    // List images for the current tenant, optionally under a logical folder.
    // The service also attaches a public URL for each image so
    // the client can render it directly without additional calls.
    const tenantId = this.resolveTenantId(currentUser, input.tenantId);
    const baseFolder = input.folder?.trim()
      ? this.buildTenantPrefix(tenantId, input.folder.trim())
      : this.buildTenantPrefix(tenantId);

    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .list(baseFolder, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      this.logger.error(`Failed to list images: ${error.message}`);
      throw new InternalServerErrorException('Failed to list images');
    }

    // Filter out folder-like entries; keep only real files.
    const fileItems = (data ?? []).filter(
      (item: SupabaseFileObject) => !!item.metadata,
    );

    const images = fileItems.map((item: SupabaseFileObject) => {
      const image = this.mapFileObjectToImageFile(baseFolder, item);

      // Build a public URL from the known bucket and path.
      // This requires the bucket to be configured as public in Supabase.
      const normalizedPath = image.path.replace(/^\/+/, '');
      image.url = `${this.publicBaseUrl}/${normalizedPath}`;

      return image;
    });

    return images;
  }

  async deleteImage(
    currentUser: User,
    input: DeleteImageInput,
  ): Promise<boolean> {
    const tenantIdFromPath = this.extractTenantIdFromPath(input.path);
    const effectiveTenantId = currentUser.tenantId;

    if (
      currentUser.role !== UserRole.VGREENS_ADMIN &&
      tenantIdFromPath &&
      effectiveTenantId &&
      tenantIdFromPath !== effectiveTenantId
    ) {
      return false;
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([input.path]);

    if (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete image');
    }

    return true;
  }

  async getSignedImageUrl(
    currentUser: User,
    input: GetSignedImageUrlInput,
  ): Promise<SignedUrl> {
    const tenantIdFromPath = this.extractTenantIdFromPath(input.path);

    if (
      currentUser.role !== UserRole.VGREENS_ADMIN &&
      tenantIdFromPath &&
      currentUser.tenantId &&
      tenantIdFromPath !== currentUser.tenantId
    ) {
      throw new InternalServerErrorException(
        'Image does not belong to the current tenant',
      );
    }

    const expiresIn = input.expiresIn ?? 600;
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(input.path, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.error(`Failed to create signed image URL: ${error?.message}`);
      throw new InternalServerErrorException(
        'Failed to create signed image URL',
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      path: input.path,
      url: data.signedUrl,
      expiresAt,
    };
  }

  async uploadImageFromStream(
    currentUser: User,
    file: FileUpload | Promise<FileUpload>,
    folder?: string | null,
    tenantIdOverride?: string | null,
  ): Promise<ImageFile> {
    const resolvedFile: FileUpload = await file;
    const tenantId = this.resolveTenantId(
      currentUser,
      tenantIdOverride ?? undefined,
    );
    const effectiveFolder = folder?.trim() || 'images';
    const sanitizedFilename = this.sanitizeFilename(resolvedFile.filename);
    const uniqueName = `${uuidv4()}-${sanitizedFilename}`;
    const basePath = this.buildTenantPrefix(tenantId, effectiveFolder);
    const path = `${basePath}/${uniqueName}`;

    const stream = resolvedFile.createReadStream();

    const { data, error: uploadError } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, stream, {
        contentType: resolvedFile.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !data?.path) {
      this.logger.error(`Failed to upload image: ${uploadError?.message}`);
      throw new InternalServerErrorException('Failed to upload image');
    }

    return {
      path,
      filename: sanitizedFilename,
      bucket: this.bucket,
      mimeType: resolvedFile.mimetype,
      size: null,
      createdAt: null,
      updatedAt: null,
    };
  }

  private resolveTenantId(
    currentUser: User,
    requestedTenantId?: string | null,
  ): string {
    if (currentUser.role === UserRole.VGREENS_ADMIN && requestedTenantId) {
      return requestedTenantId;
    }

    if (!currentUser.tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID is required for image operations',
      );
    }

    return currentUser.tenantId;
  }

  private buildTenantPrefix(tenantId: string, folder?: string): string {
    if (folder) {
      return `tenants/${tenantId}/${folder}`;
    }
    return `tenants/${tenantId}`;
  }

  private sanitizeFilename(filename?: string | null): string {
    if (!filename) {
      return 'image';
    }
    const trimmed = filename.trim();
    const parts = trimmed.split('/');
    const baseName = parts[parts.length - 1] || 'image';
    return baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  }

  private extractTenantIdFromPath(path: string): string | null {
    const segments = path.split('/');
    if (segments.length >= 2 && segments[0] === 'tenants') {
      return segments[1];
    }
    return null;
  }

  private mapFileObjectToImageFile(
    baseFolder: string,
    file: SupabaseFileObject,
  ): ImageFile {
    const path = `${baseFolder}/${file.name}`;
    const size = file.metadata?.size ?? null;
    const mimeType = file.metadata?.mimetype ?? null;

    return {
      path,
      filename: file.name,
      bucket: this.bucket,
      mimeType,
      size,
      createdAt: file.created_at ? new Date(file.created_at) : null,
      updatedAt: file.updated_at ? new Date(file.updated_at) : null,
    };
  }
}
