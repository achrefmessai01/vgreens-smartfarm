import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeaturesService } from '@modules/features/features.service';
import { TenantsService } from '@modules/tenants/tenants.service';
import { User } from '@modules/users/entities/user.entity';
import { resolveTenantId } from '@common/utils/resolve-tenant-id.util';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CAMERA_LIVESTREAM_FEATURE_KEY,
  CameraLivestreamCameraConfig,
  CameraLivestreamTenantConfig,
  SIGNED_URL_TTL_SECONDS,
  SNAPSHOT_FILENAME,
  STREAM_PLAYLIST_FILENAME,
  STREAM_TOKEN_TTL_SECONDS,
  canAccessCameraLivestream,
  formatCameraName,
  getLocalCameraLivestreamConfig,
  parseCameraLivestreamConfig,
} from './camera-livestream.config';
import { createStreamToken } from './camera-livestream-token';
import { CameraLivestreamFeed, CameraLivestreamStream } from './objects';

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
    private readonly tenantsService: TenantsService,
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

  private async resolveTenantContext(
    currentUser: User,
    tenantIdOverride?: string,
  ): Promise<CameraLivestreamTenantConfig | null> {
    const effectiveTenantId = resolveTenantId(currentUser, tenantIdOverride, false);

    const tenantFeatures = effectiveTenantId
      ? await this.featuresService.getTenantFeatures(effectiveTenantId)
      : [];
    const tenantFeature =
      tenantFeatures.find(
        (tenantFeature) =>
          tenantFeature.feature?.key === CAMERA_LIVESTREAM_FEATURE_KEY,
      ) ?? null;

    // For admin users, currentUser.tenant is null — load the tenant by id.
    const tenant =
      currentUser.tenant ??
      (effectiveTenantId
        ? await this.tenantsService.findOne(effectiveTenantId)
        : null);

    const localConfig = getLocalCameraLivestreamConfig(tenant);
    const featureConfig = parseCameraLivestreamConfig(tenantFeature?.config);
    // DB feature config wins, but tenant feature configs created before the
    // streamFolder field existed inherit the in-code default so live streams
    // keep working without a config migration.
    const livestreamConfig = featureConfig
      ? {
          ...featureConfig,
          streamFolder: featureConfig.streamFolder ?? localConfig?.streamFolder,
        }
      : localConfig;
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
      return null;
    }

    return livestreamConfig;
  }

  async listCameras(currentUser: User, tenantId?: string): Promise<CameraLivestreamFeed[]> {
    const livestreamConfig = await this.resolveTenantContext(currentUser, tenantId);

    if (!livestreamConfig) {
      return [];
    }

    return Promise.all(
      livestreamConfig.cameras.map((camera) =>
        this.resolveCamera(livestreamConfig, camera),
      ),
    );
  }

  async createStream(
    currentUser: User,
    cameraId: string,
    tenantId?: string,
  ): Promise<CameraLivestreamStream> {
    const unavailable: CameraLivestreamStream = {
      cameraId,
      url: null,
      expiresAt: null,
      available: false,
      error: 'Livestream currently unavailable',
    };

    const livestreamConfig = await this.resolveTenantContext(currentUser, tenantId);
    if (!livestreamConfig) {
      return unavailable;
    }

    const camera = livestreamConfig.cameras.find(
      (candidate) => candidate.id === cameraId,
    );
    if (!camera || !livestreamConfig.streamFolder) {
      return unavailable;
    }

    const secret = this.configService.get<string>('LIVESTREAM_STREAM_SECRET');
    if (!secret) {
      this.logger.warn(
        'LIVESTREAM_STREAM_SECRET is not configured; live streams are disabled',
      );
      return unavailable;
    }

    const expiresAtSeconds =
      Math.floor(Date.now() / 1000) + STREAM_TOKEN_TTL_SECONDS;
    const token = createStreamToken(
      {
        f: livestreamConfig.streamFolder,
        c: camera.id,
        e: expiresAtSeconds,
      },
      secret,
    );

    return {
      cameraId: camera.id,
      url: `/livestream/${encodeURIComponent(camera.id)}/${STREAM_PLAYLIST_FILENAME}?token=${encodeURIComponent(token)}`,
      expiresAt: new Date(expiresAtSeconds * 1000),
      available: true,
      error: null,
    };
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
