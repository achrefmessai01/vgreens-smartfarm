'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { getAllCameras } from '@/lib/camera-data'
import { PageHeader } from '@/components/layout/page-header'
import type { Camera, CameraStatus } from '@/types/camera.types'
import { FeatureGuard } from '@/components/features/feature-guard'
import { CameraGrid, CameraControls } from '@/components/camera-livestream'

export default function CameraLivestreamPage() {
  const { t } = useI18n()
  const [cameras] = React.useState<Camera[]>(() => getAllCameras())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedTunnel, setSelectedTunnel] = React.useState<string>('all')
  const [selectedStatus, setSelectedStatus] = React.useState<
    CameraStatus | 'all'
  >('all')

  const filteredCameras = React.useMemo(() => {
    return cameras.filter((camera) => {
      const matchesSearch =
        searchQuery === '' ||
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.tunnelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTunnel =
        selectedTunnel === 'all' || camera.tunnelId === selectedTunnel

      const matchesStatus =
        selectedStatus === 'all' || camera.status === selectedStatus

      return matchesSearch && matchesTunnel && matchesStatus
    })
  }, [cameras, searchQuery, selectedTunnel, selectedStatus])

  const handleCameraClick = (camera: Camera) => {
    console.log('Camera clicked:', camera)
  }

  return (
    <FeatureGuard featureKey="camera_livestream">
      <div className="space-y-6">
        <PageHeader
          title={t.pages.cameraLivestream.title}
          subtitle={t.pages.cameraLivestream.subtitle}
        />

        <CameraControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTunnel={selectedTunnel}
          onTunnelChange={setSelectedTunnel}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          totalCameras={cameras.length}
          filteredCount={filteredCameras.length}
        />

        <CameraGrid
          cameras={filteredCameras}
          onCameraClick={handleCameraClick}
        />
      </div>
    </FeatureGuard>
  )
}
