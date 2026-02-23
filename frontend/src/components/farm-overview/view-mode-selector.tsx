"use client";

import { LayoutGrid, Map as MapIcon } from "lucide-react";

interface ViewModeSelectorProps {
  value: "heatmap" | "discrete";
  onValueChange: (value: "heatmap" | "discrete") => void;
  heatmapLabel: string;
  discreteLabel: string;
}

export function ViewModeSelector({
  value,
  onValueChange,
  heatmapLabel,
  discreteLabel,
}: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/40 dark:bg-muted/20 border border-border/40 rounded-lg shadow-inner">
      <button
        type="button"
        onClick={() => onValueChange("heatmap")}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
          ${
            value === "heatmap"
              ? "bg-primary text-primary-foreground"
              : "bg-background dark:bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
        `}
      >
        <MapIcon size={14} className="shrink-0" />
        {heatmapLabel}
      </button>

      <button
        type="button"
        onClick={() => onValueChange("discrete")}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200
          ${
            value === "discrete"
              ? "bg-primary text-primary-foreground"
              : "bg-background dark:bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
        `}
      >
        <LayoutGrid size={14} className="shrink-0" />
        {discreteLabel}
      </button>
    </div>
  );
}
