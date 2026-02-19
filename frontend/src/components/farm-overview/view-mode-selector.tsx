"use client";

import { LayoutGrid, Map as MapIcon } from "lucide-react";

interface ViewModeSelectorProps {
  value: "grid" | "map";
  onValueChange: (value: "grid" | "map") => void;
  gridLabel: string;
  mapLabel: string;
}

export function ViewModeSelector({
  value,
  onValueChange,
  gridLabel,
  mapLabel,
}: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/40 dark:bg-muted/20 border border-border/40 rounded-lg shadow-inner">
      <button
        type="button"
        onClick={() => onValueChange("grid")}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
          ${
            value === "grid"
              ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
        `}
      >
        <LayoutGrid
          size={14}
          className={
            value === "grid" ? "text-primary" : "text-muted-foreground"
          }
        />
        {gridLabel}
      </button>

      <button
        type="button"
        onClick={() => onValueChange("map")}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
          ${
            value === "map"
              ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
        `}
      >
        <MapIcon
          size={14}
          className={value === "map" ? "text-primary" : "text-muted-foreground"}
        />
        {mapLabel}
      </button>
    </div>
  );
}
