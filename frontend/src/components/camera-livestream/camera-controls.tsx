'use client'

import {
  getCameraStatusOptions,
  getCameraTunnelOptions,
  hasActiveCameraFilters,
} from '@/lib/camera-utils'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'
import { getAllTunnels } from '@/lib/tunnel-data'
import type { CameraStatus } from '@/types/camera.types'
import { StyledSelect } from '@/components/ui/styled-select'

interface CameraControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTunnel: string
  onTunnelChange: (tunnelId: string) => void
  selectedStatus: CameraStatus | 'all'
  onStatusChange: (status: CameraStatus | 'all') => void
  totalCameras: number
  filteredCount: number
}

export function CameraControls({
  searchQuery,
  onSearchChange,
  selectedTunnel,
  onTunnelChange,
  selectedStatus,
  onStatusChange,
  totalCameras,
  filteredCount,
}: CameraControlsProps) {
  const { t } = useI18n()
  const tunnels = React.useMemo(() => getAllTunnels(), [])

  const statusOptions = React.useMemo(
    () =>
      getCameraStatusOptions({
        allStatuses: t.pages.cameraLivestream.filters.allStatuses,
        online: t.pages.cameraLivestream.filters.online,
        recording: t.pages.cameraLivestream.filters.recording,
        offline: t.pages.cameraLivestream.filters.offline,
        error: t.pages.cameraLivestream.filters.error,
      }),
    [t]
  )

  const tunnelOptions = React.useMemo(
    () =>
      getCameraTunnelOptions(
        tunnels,
        t.pages.cameraLivestream.filters.allTunnels
      ),
    [tunnels, t]
  )

  const hasActiveFilters = hasActiveCameraFilters(
    searchQuery,
    selectedTunnel,
    selectedStatus
  )

  const clearFilters = () => {
    onSearchChange('')
    onTunnelChange('all')
    onStatusChange('all')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/50" />
          <Input
            type="text"
            placeholder={
              t.pages.cameraLivestream.searchPlaceholder || 'Search cameras...'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tunnel Filter */}
        <StyledSelect
          value={selectedTunnel}
          onValueChange={onTunnelChange}
          options={tunnelOptions}
          placeholder={
            t.pages.cameraLivestream.filters.selectTunnel || 'Select tunnel'
          }
          className="w-full sm:w-[180px]"
        />

        <StyledSelect
          value={selectedStatus}
          onValueChange={(val) => onStatusChange(val as CameraStatus | 'all')}
          options={statusOptions}
          placeholder={
            t.pages.cameraLivestream.filters.selectStatus || 'Select status'
          }
          className="w-full sm:w-[180px]"
        />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/70">
          <Filter className="h-4 w-4" />
          <span>
            {filteredCount === totalCameras ? (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground dark:text-white">
                  {totalCameras}
                </span>{' '}
                camera{totalCameras !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground dark:text-white">
                  {filteredCount}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground dark:text-white">
                  {totalCameras}
                </span>{' '}
                cameras
              </>
            )}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
              'text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white',
              'hover:bg-accent dark:hover:bg-accent/50 transition-colors'
            )}
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
