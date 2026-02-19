import type { Bay, ParameterType } from "@/lib/farm-types";
import { EmptyState } from "./empty-state";
import { ViewSensorMap } from "./views/view-sensor-map";
import { ViewSingleBay } from "./views/view-single-bay";

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
        <ViewSensorMap
          key={bays[0].id}
          bay={bays[0]}
          parameter={parameter}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          className="h-full"
          showOnlyFilledPositions={false}
        />
      ) : (
        <ViewSingleBay
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
