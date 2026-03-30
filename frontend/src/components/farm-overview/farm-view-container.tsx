import type { Bay, ParameterType } from '@/types/farm.types';
import { EmptyState } from './empty-state';
import { ParGraphSection } from './par-graph-section';
import { ViewSensorMap } from './views/view-sensor-map';
import { ViewSingleBay } from './views/view-single-bay';

interface FarmDataDisplayProps {
  bays: Bay[];
  viewMode: 'heatmap' | 'discrete' | 'graph';
  parameter: ParameterType;
  greenhouseId: string;
  greenhouseLabel: string;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  parameterLabel: string;
  noSensorLabel: string;
  noDataMessage: string;
}

export function FarmDataDisplay({
  bays,
  viewMode,
  parameter,
  greenhouseId,
  greenhouseLabel,
  selectedSlotId,
  onSelectSlot,
  parameterLabel,
  noSensorLabel,
  noDataMessage,
}: FarmDataDisplayProps) {
  const showEmpty = bays.length === 0 && viewMode !== 'graph';
  if (showEmpty) {
    return <EmptyState message={noDataMessage} />;
  }

  return (
    <div
      className={
        viewMode === 'graph'
          ? 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-clip'
          : 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-clip p-0.5 sm:p-2'
      }
    >
      {viewMode === 'graph' ? (
        <ParGraphSection
          bay={bays[0] ?? null}
          greenhouseId={greenhouseId}
          greenhouseLabel={greenhouseLabel}
          embedded
          className="h-full w-full"
        />
      ) : viewMode === 'discrete' ? (
        <ViewSensorMap
          key={bays[0].id}
          bay={bays[0]}
          parameter={parameter}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          className="min-h-0 flex-1"
          showOnlyFilledPositions={false}
        />
      ) : (
        <ViewSingleBay
          key={bays.map((b) => b.id).join('-')}
          bays={bays}
          parameter={parameter}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          parameterLabel={parameterLabel}
          noSensorLabel={noSensorLabel}
          className="h-full"
        />
      )}
    </div>
  );
}
