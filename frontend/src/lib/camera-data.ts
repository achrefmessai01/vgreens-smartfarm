import { getAllTunnels } from './tunnel-data'
import type { Camera, CameraStatus } from '@/types/camera.types'

const CAMERA_LOCATIONS = ['Entrance', 'Center', 'Exit', 'Overview', 'Corner']
const RESOLUTIONS = ['1080p', '720p', '4K']
const FPS_OPTIONS = [15, 30, 60]

function getRandomStatus(): CameraStatus {
  const rand = Math.random()
  if (rand < 0.7) return 'online'
  if (rand < 0.85) return 'recording'
  if (rand < 0.95) return 'offline'
  return 'error'
}

export function generateCameras(): Camera[] {
  const tunnels = getAllTunnels()
  const cameras: Camera[] = []

  tunnels.forEach((tunnel) => {
    const cameraCount = Math.floor(Math.random() * 3) + 1

    for (let i = 1; i <= cameraCount; i++) {
      const status = getRandomStatus()
      const hoursAgo = Math.floor(Math.random() * 24)
      const lastActive = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

      cameras.push({
        id: `camera-${tunnel.id}-${i}`,
        name: `${tunnel.name} Camera ${i}`,
        tunnelId: tunnel.id,
        tunnelName: tunnel.name,
        status,
        location:
          CAMERA_LOCATIONS[Math.floor(Math.random() * CAMERA_LOCATIONS.length)],
        lastActive,
        resolution: RESOLUTIONS[Math.floor(Math.random() * RESOLUTIONS.length)],
        fps: FPS_OPTIONS[Math.floor(Math.random() * FPS_OPTIONS.length)],
      })
    }
  })

  return cameras
}

export function getAllCameras(): Camera[] {
  return generateCameras()
}

export function getCamerasByTunnel(tunnelId: string): Camera[] {
  return getAllCameras().filter((camera) => camera.tunnelId === tunnelId)
}

export function getCamerasByStatus(status: CameraStatus): Camera[] {
  return getAllCameras().filter((camera) => camera.status === status)
}
