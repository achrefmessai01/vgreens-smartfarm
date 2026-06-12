export type CameraStatus = 'online' | 'offline' | 'recording' | 'error';

export interface Camera {
  id: string;
  name: string;
  tunnelId: string;
  tunnelName: string;
  status: CameraStatus;
  location: string;
  lastActive?: Date;
  resolution?: string;
  fps?: number;
}

export interface CameraLivestreamFeed {
  id: string;
  name: string;
  path: string;
  snapshotUrl?: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  available: boolean;
  error?: string | null;
}

export interface CameraLivestreamStream {
  cameraId: string;
  url?: string | null;
  expiresAt?: string | null;
  available: boolean;
  error?: string | null;
}
