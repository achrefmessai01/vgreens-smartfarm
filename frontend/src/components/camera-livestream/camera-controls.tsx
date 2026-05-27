'use client';

import {
  getCameraStatusOptions,
  getCameraTunnelOptions,
  hasActiveCameraFilters,
} from '@/lib/camera-utils';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { getAllTunnels } from '@/lib/tunnel-data';
import type { CameraStatus } from '@/types/camera.types';
import { StyledSelect } from '@/components/ui/styled-select';

interface CameraControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTunnel: string;
  onTunnelChange: (tunnelId: string) => void;
  selectedStatus: CameraStatus | 'all';
  onStatusChange: (status: CameraStatus | 'all') => void;
  totalCameras: number;
  filteredCount: number;
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
  const { t } = useI18n();
  const tunnels = React.useMemo(() => getAllTunnels(), []);

  const statusOptions = React.useMemo(
    () =>
      getCameraStatusOptions({
        allStatuses: t.pages.cameraLivestream.filters.allStatuses,
        online: t.pages.cameraLivestream.filters.online,
        recording: t.pages.cameraLivestream.filters.recording,
        offline: t.pages.cameraLivestream.filters.offline,
        error: t.pages.cameraLivestream.filters.error,
      }),
    [t],
  );

  const tunnelOptions = React.useMemo(
    () =>
      getCameraTunnelOptions(
        tunnels,
        t.pages.cameraLivestream.filters.allTunnels,
      ),
    [tunnels, t],
  );

  const hasActiveFilters = hasActiveCameraFilters(
    searchQuery,
    selectedTunnel,
    selectedStatus,
  );

  const clearFilters = () => {
    onSearchChange('');
    onTunnelChange('all');
    onStatusChange('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 dark:text-white/50" />
          <Input
            type="text"
            placeholder={
              t.pages.cameraLivestream.searchPlaceholder || 'Search cameras...'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pr-9 pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors dark:text-white/50 dark:hover:text-white"
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm dark:text-white/70">
          <Filter className="h-4 w-4" />
          <span>
            {filteredCount === totalCameras ? (
              <>
                {t.common.showing}{' '}
                <span className="text-foreground font-semibold dark:text-white">
                  {totalCameras}
                </span>{' '}
                {(totalCameras !== 1
                  ? t.pages.cameraLivestream.camerasCountPlural
                  : t.pages.cameraLivestream.camerasCountSingular
                )
                  .replace('{count} ', '')
                  .trim()}
              </>
            ) : (
              <>
                {t.common.showing}{' '}
                <span className="text-foreground font-semibold dark:text-white">
                  {filteredCount}
                </span>{' '}
                {t.common.of}{' '}
                <span className="text-foreground font-semibold dark:text-white">
                  {totalCameras}
                </span>{' '}
                {t.pages.cameraLivestream.camerasCountPlural
                  .replace('{count} ', '')
                  .trim()}
              </>
            )}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
              'text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white',
              'hover:bg-accent dark:hover:bg-accent/50 transition-colors',
            )}
          >
            <X className="h-3.5 w-3.5" />
            {t.pages.cameraLivestream.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
