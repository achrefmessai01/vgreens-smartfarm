import type { Bay, ParameterType } from "@/lib/farm-types";
import { EmptyState } from "./empty-state";
import { SensorMapView } from "./sensor-map-view";
import { SingleBayView } from "./single-bay-view";

interface FarmDataDisplayProps {
  bays: Bay[];
  viewMode: "grid" | "map";
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
  parameterLabel,
  noSensorLabel,
  noDataMessage,
}: FarmDataDisplayProps) {
  if (bays.length === 0) {
    return <EmptyState message={noDataMessage} />;
  }

  return (
    <div className="h-full p-2 sm:p-4">
      {viewMode === "map" ? (
        <SensorMapView
          key={bays[0].id}
          bay={bays[0]}
          parameter={parameter}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          className="h-full"
          showOnlyFilledPositions
        />
      ) : (
        <SingleBayView
          key={bays[0].id}
          bay={bays[0]}
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
