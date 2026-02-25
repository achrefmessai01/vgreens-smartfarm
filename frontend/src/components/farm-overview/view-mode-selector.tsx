"use client";
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
    <div className="inline-flex items-center rounded-full bg-muted/40 dark:bg-muted/20 p-0.5">
      <button
        type="button"
        onClick={() => onValueChange("heatmap")}
        className={`
          px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-150
          ${
            value === "heatmap"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        {heatmapLabel}
      </button>

      <button
        type="button"
        onClick={() => onValueChange("discrete")}
        className={`
          px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-150
          ${
            value === "discrete"
              ? "bg-emerald-400 text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        {discreteLabel}
      </button>
    </div>
  );
}
