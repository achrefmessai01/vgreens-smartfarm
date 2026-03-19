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
