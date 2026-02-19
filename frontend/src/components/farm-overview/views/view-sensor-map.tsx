"use client";

import {
  formatParameterDisplayValue,
  getParameterColor,
  getParameterUnit,
} from "@/lib/farm-data";
import type { Bay, ParameterType, PlantSlot } from "@/lib/farm-types";
import {
  getDeviceIdFromSlotId,
  getMapDeviceId,
  SENSOR_MAP_ASPECT_RATIO,
  SENSOR_MAP_POSITIONS,
} from "@/lib/sensor-map-positions";
import { cn } from "@/lib/utils";
import * as React from "react";

/** Which sensor types support which parameters (so we don't show all at once). */
function isParameterSupportedByType(
  parameter: ParameterType,
  type: "air" | "lux" | "par" | "soil",
): boolean {
  switch (parameter) {
    // Air sensors
    case "temperature":
    case "humidity":
    case "co2":
    case "vpd":
    case "battery_v":
    case "voltage_v":
    case "current_ma":
    case "rssi":
    case "snr":
      return type === "air";
    // Light / PAR sensors
    case "par":
    case "par_estimated":
    case "lux":
      return type === "lux";
    // Soil sensors
    case "soil_moisture":
    case "soil_temp":
    case "soil_conductivity":
    case "soilEC":
      return type === "soil";
    // Fallback: allow on any sensor type
    default:
      return true;
  }
}

/** One-time build: map canonical device id → slot (Light_XX → Lux_XX for map key) */
function buildDeviceToSlotMap(bay: Bay): Map<string, PlantSlot> {
  const map = new Map<string, PlantSlot>();
  for (const row of bay.rows) {
    for (const col of row.columns) {
      for (const slot of col.slots) {
        if (!slot) continue;
        const device = getDeviceIdFromSlotId(slot.id);
        if (device) map.set(getMapDeviceId(device), slot);
      }
    }
  }
  return map;
}

interface ViewSensorMapProps {
  bay: Bay;
  parameter: ParameterType;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  bayLabel?: string;
  className?: string;
  /** When true, only show positions that have sensor data (no gray placeholders) */
  showOnlyFilledPositions?: boolean;
}

/**
 * Schematic map view (115m x 40m) with sensor values at fixed positions.
 * Air = squares, Lux = circles, PAR = circle (pink).
 */
export function ViewSensorMap({
  bay,
  parameter,
  selectedSlotId,
  onSelectSlot,
  showOnlyFilledPositions = false,
}: ViewSensorMapProps) {
  const deviceToSlot = React.useMemo(
    () => (bay ? buildDeviceToSlotMap(bay) : new Map<string, PlantSlot>()),
    [bay],
  );
  const unit = getParameterUnit(parameter);
  const positionsToShow = React.useMemo(() => {
    return SENSOR_MAP_POSITIONS.filter((pos) => {
      // Only show sensor types that support the selected parameter
      if (!isParameterSupportedByType(parameter, pos.type)) return false;

      const slot = deviceToSlot.get(getMapDeviceId(pos.deviceId));
      if (!slot) {
        // When only filled positions should be shown, hide placeholders
        return !showOnlyFilledPositions;
      }

      const value = slot.values?.[parameter];
      // Hide sensors that don't have this parameter value at all
      if (typeof value !== "number" || Number.isNaN(value)) return false;

      return true;
    });
  }, [deviceToSlot, parameter, showOnlyFilledPositions]);

  return (
    <div>
      {/* Map container: aspect ratio 115:40, min height so it stays visible */}
      <div
        className="flex-1 min-h-[200px] relative rounded-lg bg-muted/20 border border-border/40 overflow-hidden"
        style={{ aspectRatio: String(SENSOR_MAP_ASPECT_RATIO) }}
      >
        <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground/80">
          115m × 40m
        </span>
        {positionsToShow.map((pos) => {
          const slot = deviceToSlot.get(getMapDeviceId(pos.deviceId)) ?? null;
          const value =
            slot && typeof slot.values?.[parameter] === "number"
              ? (slot.values[parameter] as number)
              : null;
          const color = slot
            ? getParameterColor(value ?? 0, parameter, slot.id)
            : "rgb(200, 200, 200)";
          const isSelected = slot ? selectedSlotId === slot.id : false;
          const isAir = pos.type === "air";
          const isPar = pos.type === "par";
          const isSoil = pos.type === "soil";
          // Slight offset for soil so it doesn't fully overlap Air_03 at same coords
          const offset = isSoil
            ? { transform: "translate(calc(-50% + 20px), calc(-50% + 14px))" }
            : { transform: "translate(-50%, -50%)" };

          return (
            <div
              key={pos.deviceId}
              className="absolute"
              style={{
                left: `${pos.leftPercent}%`,
                top: `${pos.topPercent}%`,
                ...offset,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  onSelectSlot(slot ? (isSelected ? null : slot.id) : null)
                }
                disabled={!slot}
                className={cn(
                  "flex flex-col items-center justify-center min-w-11 min-h-11 rounded-lg transition-all text-sm font-semibold tabular-nums",
                  "hover:ring-2 hover:ring-primary/50 hover:scale-105",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  !slot && "cursor-not-allowed border border-border",
                )}
                style={{
                  backgroundColor: color,
                  color: slot
                    ? "rgba(255,255,255,0.98)"
                    : "var(--muted-foreground)",
                  boxShadow: slot
                    ? "0 1px 3px rgba(0,0,0,0.15)"
                    : "0 1px 2px rgba(0,0,0,0.08)",
                  textShadow: slot ? "0 1px 2px rgba(0,0,0,0.4)" : "none",
                  borderRadius: isAir || isSoil ? "8px" : "50%",
                  width: isPar ? 52 : isSoil ? 40 : 44,
                  height: isPar ? 52 : isSoil ? 40 : 44,
                }}
                title={
                  slot && value != null
                    ? `${pos.deviceId}: ${formatParameterDisplayValue(
                        value,
                      )}${unit}`
                    : pos.deviceId
                }
              >
                {value != null ? (
                  <span className="leading-tight text-sm font-bold px-0.5">
                    {formatParameterDisplayValue(value)}
                  </span>
                ) : (
                  <span
                    className={slot ? "opacity-90" : "text-muted-foreground"}
                  >
                    --
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
