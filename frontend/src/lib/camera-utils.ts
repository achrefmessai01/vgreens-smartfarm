import type { CameraStatus } from '@/types/camera.types'
import type { Tunnel } from '@/types/tunnel.types'

export function getCameraStatusColor(status: CameraStatus): string {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'recording':
      return 'bg-blue-500 animate-pulse'
    case 'offline':
      return 'bg-gray-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export function getCameraStatusVariant(
  status: CameraStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'online':
      return 'default'
    case 'recording':
      return 'secondary'
    case 'offline':
      return 'outline'
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function formatCameraLastActive(
  date: Date | undefined,
  currentTime: number
): string {
  if (!date) return 'Never'
  const hoursAgo = Math.floor((currentTime - date.getTime()) / (1000 * 60 * 60))
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo === 1) return '1 hour ago'
  return `${hoursAgo} hours ago`
}

export interface CameraStatusOption {
  value: CameraStatus | 'all'
  label: string
}

export interface CameraTunnelOption {
  value: string
  label: string
}

export interface CameraFilterTranslations {
  allStatuses?: string
  online?: string
  recording?: string
  offline?: string
  error?: string
  allTunnels?: string
}

export function getCameraStatusOptions(
  translations: CameraFilterTranslations
): CameraStatusOption[] {
  return [
    {
      value: 'all',
      label: translations.allStatuses || 'All Statuses',
    },
    {
      value: 'online',
      label: translations.online || 'Online',
    },
    {
      value: 'recording',
      label: translations.recording || 'Recording',
    },
    {
      value: 'offline',
      label: translations.offline || 'Offline',
    },
    {
      value: 'error',
      label: translations.error || 'Error',
    },
  ]
}

export function getCameraTunnelOptions(
  tunnels: Tunnel[],
  allTunnelsLabel?: string
): CameraTunnelOption[] {
  return [
    {
      value: 'all',
      label: allTunnelsLabel || 'All Tunnels',
    },
    ...tunnels.map((tunnel) => ({
      value: tunnel.id,
      label: tunnel.name,
    })),
  ]
}

export function hasActiveCameraFilters(
  searchQuery: string,
  selectedTunnel: string,
  selectedStatus: CameraStatus | 'all'
): boolean {
  return (
    searchQuery !== '' || selectedTunnel !== 'all' || selectedStatus !== 'all'
  )
}
