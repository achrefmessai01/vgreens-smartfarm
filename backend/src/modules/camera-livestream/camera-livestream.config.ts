import { UserRole } from '@common/enums';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { User } from '@modules/users/entities/user.entity';

export const CAMERA_LIVESTREAM_FEATURE_KEY = 'camera_livestream';
export const SNAPSHOT_FILENAME = 'latest.jpg';
export const SIGNED_URL_TTL_SECONDS = 600;
export const STREAM_TOKEN_TTL_SECONDS = 6 * 60 * 60;
export const STREAM_PLAYLIST_FILENAME = 'index.m3u8';

export interface CameraLivestreamCameraConfig {
  id: string;
  name?: string;
  path?: string;
}

export interface CameraLivestreamTenantConfig {
  folder: string;
  /**
   * Upstream HLS folder for live streams (relative to the stream proxy
   * upstream base URL). When absent, real livestream is disabled for the
   * tenant and only preview images are available.
   */
  streamFolder?: string;
  cameras: CameraLivestreamCameraConfig[];
}

interface LocalTenantConfig extends CameraLivestreamTenantConfig {
  tenantIdentifiers: string[];
}

const FRUTANIA_CAMERA_IDS = ['Cam01_', 'Cam02_', 'Cam03_', 'Cam04_', 'Cam05_'];

const LOCAL_CAMERA_LIVESTREAM_TENANT_CONFIGS: LocalTenantConfig[] = [
  {
    // Matched against the tenant's normalized name/companyName/influxBucketName/id
    // (exact match after lowercasing + collapsing non-alphanumerics to spaces).
    // We match on companyName "Frutania GmbH" (-> 'frutania gmbh'), which was NOT
    // changed by the Frutania -> Agrania rename, so it stays stable across the
    // rename and across environments. Storage folders below stay 'frutania*'.
    tenantIdentifiers: ['Frutania GmbH'],
    folder: 'frutania-livestream',
    streamFolder: 'frutania',
    cameras: FRUTANIA_CAMERA_IDS.map((id) => ({
      id,
      name: formatCameraName(id),
    })),
  },
];

function normalizeIdentifier(value?: string | null): string {
  return (
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim() ?? ''
  );
}

function tenantIdentifiers(tenant?: Tenant | null): string[] {
  return [
    tenant?.id,
    tenant?.name,
    tenant?.companyName,
    tenant?.influxBucketName,
  ].filter((value): value is string => Boolean(value));
}

export function formatCameraName(cameraId: string): string {
  const numericId = cameraId.replace(/\D/g, '');
  return numericId ? `Camera ${numericId}` : cameraId;
}

export function parseCameraLivestreamConfig(
  config?: Record<string, any> | null,
): CameraLivestreamTenantConfig | null {
  if (!config || typeof config !== 'object') {
    return null;
  }

  const folder =
    typeof config.folder === 'string' && config.folder.trim()
      ? config.folder.trim()
      : null;

  const streamFolder =
    typeof config.streamFolder === 'string' && config.streamFolder.trim()
      ? config.streamFolder.trim().replace(/^\/+|\/+$/g, '')
      : undefined;

  const cameras = Array.isArray(config.cameras)
    ? config.cameras
        .map((camera: unknown): CameraLivestreamCameraConfig | null => {
          if (!camera || typeof camera !== 'object') {
            return null;
          }

          const rawCamera = camera as Record<string, unknown>;
          const id =
            typeof rawCamera.id === 'string' ? rawCamera.id.trim() : '';
          if (!id) {
            return null;
          }

          return {
            id,
            name:
              typeof rawCamera.name === 'string' && rawCamera.name.trim()
                ? rawCamera.name.trim()
                : undefined,
            path:
              typeof rawCamera.path === 'string' && rawCamera.path.trim()
                ? rawCamera.path.trim()
                : undefined,
          };
        })
        .filter((camera): camera is CameraLivestreamCameraConfig =>
          Boolean(camera),
        )
    : [];

  if (!folder && !streamFolder && cameras.every((camera) => !camera.path)) {
    return null;
  }

  return {
    folder: folder ?? '',
    streamFolder,
    cameras,
  };
}

export function getLocalCameraLivestreamConfig(
  tenant?: Tenant | null,
): CameraLivestreamTenantConfig | null {
  const normalizedTenantIdentifiers = new Set(
    tenantIdentifiers(tenant).map(normalizeIdentifier).filter(Boolean),
  );

  const match = LOCAL_CAMERA_LIVESTREAM_TENANT_CONFIGS.find((config) =>
    config.tenantIdentifiers.some((identifier) =>
      normalizedTenantIdentifiers.has(normalizeIdentifier(identifier)),
    ),
  );

  if (!match) {
    return null;
  }

  return {
    folder: match.folder,
    streamFolder: match.streamFolder,
    cameras: match.cameras,
  };
}

export function canAccessCameraLivestream(params: {
  user?: User | null;
  hasTenantFeature: boolean;
  hasTenantConfig: boolean;
}): boolean {
  const { user, hasTenantFeature, hasTenantConfig } = params;

  if (!user?.tenantId) {
    return false;
  }

  if (user.role === UserRole.VGREENS_ADMIN) {
    return hasTenantFeature || hasTenantConfig;
  }

  // Camera livestream is a tenant-specific capability. It should only be enabled for tenants explicitly configured for this feature.
  return hasTenantFeature || hasTenantConfig;
}
