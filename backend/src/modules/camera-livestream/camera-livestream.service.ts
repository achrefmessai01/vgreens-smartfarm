import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeaturesService } from '@modules/features/features.service';
import { User } from '@modules/users/entities/user.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CAMERA_LIVESTREAM_FEATURE_KEY,
  CameraLivestreamCameraConfig,
  CameraLivestreamTenantConfig,
  SIGNED_URL_TTL_SECONDS,
  SNAPSHOT_FILENAME,
  canAccessCameraLivestream,
  formatCameraName,
  getLocalCameraLivestreamConfig,
  parseCameraLivestreamConfig,
} from './camera-livestream.config';
import { CameraLivestreamFeed } from './objects';

interface SupabaseFileObject {
  name: string;
  updated_at?: string;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class CameraLivestreamService {
  private readonly logger = new Logger(CameraLivestreamService.name);
  private readonly supabase: SupabaseClient<any, any, any, any, any>;
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly featuresService: FeaturesService,
  ) {
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
      this.configService.get<string>('SUPABASE_LIVESTREAM_BUCKET') ??
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ??
      'vgreens-files';

    this.supabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async listCameras(currentUser: User): Promise<CameraLivestreamFeed[]> {
    const tenantFeatures = currentUser.tenantId
      ? await this.featuresService.getTenantFeatures(currentUser.tenantId)
      : [];
    const tenantFeature =
      tenantFeatures.find(
        (tenantFeature) =>
          tenantFeature.feature?.key === CAMERA_LIVESTREAM_FEATURE_KEY,
      ) ?? null;

    const localConfig = getLocalCameraLivestreamConfig(currentUser.tenant);
    const featureConfig = parseCameraLivestreamConfig(tenantFeature?.config);
    const livestreamConfig = featureConfig ?? localConfig;
    const hasTenantFeature = Boolean(
      tenantFeature?.enabled && tenantFeature.feature?.isActive,
    );

    if (
      !canAccessCameraLivestream({
        user: currentUser,
        hasTenantFeature,
        hasTenantConfig: Boolean(livestreamConfig),
      })
    ) {
      return [];
    }

    if (!livestreamConfig) {
      return [];
    }

    return Promise.all(
      livestreamConfig.cameras.map((camera) =>
        this.resolveCamera(livestreamConfig, camera),
      ),
    );
  }

  private async resolveCamera(
    tenantConfig: CameraLivestreamTenantConfig,
    camera: CameraLivestreamCameraConfig,
  ): Promise<CameraLivestreamFeed> {
    const path = this.resolveCameraPath(tenantConfig, camera);
    const pathSegments = path.split('/');
    const folder = pathSegments.slice(0, -1).join('/');
    const filename = pathSegments[pathSegments.length - 1] || SNAPSHOT_FILENAME;
    const baseCamera = {
      id: camera.id,
      name: camera.name ?? formatCameraName(camera.id),
      path,
    };

    const { data: files, error: listError } = await this.supabase.storage
      .from(this.bucket)
      .list(folder, {
        limit: 100,
        search: filename,
      });

    if (listError) {
      this.logger.warn(
        `Failed to inspect camera livestream image ${path}: ${listError.message}`,
      );
      return this.unavailableCamera(baseCamera);
    }

    const latestFile = (files ?? []).find(
      (file: SupabaseFileObject) => file.name === filename && !!file.metadata,
    );

    if (!latestFile) {
      return this.unavailableCamera(baseCamera);
    }

    const { data: signedUrlData, error: signedUrlError } =
      await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      this.logger.warn(
        `Failed to sign camera livestream image ${path}: ${signedUrlError?.message}`,
      );
      return this.unavailableCamera({
        ...baseCamera,
        updatedAt: this.parseDate(
          latestFile.updated_at ?? latestFile.created_at,
        ),
      });
    }

    return {
      ...baseCamera,
      snapshotUrl: signedUrlData.signedUrl,
      updatedAt: this.parseDate(latestFile.updated_at ?? latestFile.created_at),
      expiresAt: new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000),
      available: true,
      error: null,
    };
  }

  private resolveCameraPath(
    tenantConfig: CameraLivestreamTenantConfig,
    camera: CameraLivestreamCameraConfig,
  ): string {
    if (camera.path) {
      return camera.path.replace(/^\/+/, '');
    }

    if (!tenantConfig.folder) {
      throw new InternalServerErrorException(
        'Camera livestream folder is not configured',
      );
    }

    return `${tenantConfig.folder}/${camera.id}/${SNAPSHOT_FILENAME}`;
  }

  private unavailableCamera(
    baseCamera: Pick<CameraLivestreamFeed, 'id' | 'name' | 'path'> & {
      updatedAt?: Date | null;
    },
  ): CameraLivestreamFeed {
    return {
      ...baseCamera,
      snapshotUrl: null,
      updatedAt: baseCamera.updatedAt ?? null,
      expiresAt: null,
      available: false,
      error: 'Camera feed currently unavailable',
    };
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
