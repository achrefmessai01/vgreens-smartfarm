import { UserRole } from '@/generated/graphql';

export const CAMERA_LIVESTREAM_FEATURE_KEY = 'camera_livestream';

interface CameraLivestreamUser {
  role?: string | null;
  tenantId?: string | null;
}

export function canAccessCameraLivestream(params: {
  user?: CameraLivestreamUser | null;
  enabledFeatures: Set<string>;
  includeInternalAdmins?: boolean;
}): boolean {
  const { user, enabledFeatures, includeInternalAdmins = true } = params;

  if (includeInternalAdmins && user?.role === UserRole.VgreensAdmin) {
    return true;
  }

  if (!user?.tenantId) {
    return false;
  }

  // Camera livestream is a tenant-specific capability. It should only be enabled for tenants explicitly configured for this feature.
  return enabledFeatures.has(CAMERA_LIVESTREAM_FEATURE_KEY);
}
