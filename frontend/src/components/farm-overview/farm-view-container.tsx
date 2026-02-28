import type { Bay, ParameterType } from '@/lib/farm-types';
import { EmptyState } from './empty-state';
import { ParGraphSection } from './par-graph-section';
import { ViewSensorMap } from './views/view-sensor-map';
import { ViewSingleBay } from './views/view-single-bay';

interface FarmDataDisplayProps {
  bays: Bay[];
  viewMode: 'heatmap' | 'discrete' | 'graph';
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  bayLabel: string;
  parameterLabel: string;
  noSensorLabel: string;
  noDataMessage: string;
}

export function FarmDataDisplay({
  bays,
  viewMode,
  parameter,
  selectedSlotId,
  onSelectSlot,
  bayLabel,
  parameterLabel,
  noSensorLabel,
  noDataMessage,
}: FarmDataDisplayProps) {
  if (bays.length === 0) {
    return <EmptyState message={noDataMessage} />;
  }

  return (
    <div
      className={
        viewMode === 'graph'
          ? 'flex flex-col h-full min-h-0'
          : 'flex flex-col h-full min-h-0 p-2 sm:p-4'
      }
    >
      {viewMode === 'graph' ? (
        <ParGraphSection
          bay={bays[0] ?? null}
          greenhouseLabel={bays[0]?.name ?? bayLabel}
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
          className="flex-1 min-h-0"
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
