"use client";
interface ViewModeSelectorProps {
  value: "heatmap" | "discrete" | "graph";
  onValueChange: (value: "heatmap" | "discrete" | "graph") => void;
  heatmapLabel: string;
  discreteLabel: string;
  graphLabel?: string;
  showGraphOption?: boolean;
}

export function ViewModeSelector({
  value,
  onValueChange,
  heatmapLabel,
  discreteLabel,
  graphLabel = "Graph",
  showGraphOption = false,
}: ViewModeSelectorProps) {
  return (
    <div
      className={`
        grid w-full min-w-0 rounded-2xl bg-muted/40 p-1 dark:bg-muted/20
        ${showGraphOption ? 'grid-cols-3' : 'grid-cols-2'}
        sm:inline-flex sm:w-auto sm:grid-cols-none sm:items-center sm:rounded-full sm:p-0.5
      `}
    >
      <button
        type="button"
        onClick={() => onValueChange("heatmap")}
        className={`
          min-w-0 rounded-xl px-2.5 py-2 text-[11px] font-semibold leading-tight text-center transition-colors duration-150
          sm:rounded-full sm:px-3 sm:py-1 sm:text-xs
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
          min-w-0 rounded-xl px-2.5 py-2 text-[11px] font-semibold leading-tight text-center transition-colors duration-150
          sm:rounded-full sm:px-3 sm:py-1 sm:text-xs
          ${
            value === "discrete"
              ? "bg-emerald-400 text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        {discreteLabel}
      </button>

      {showGraphOption && (
        <button
          type="button"
          onClick={() => onValueChange("graph")}
          className={`
            min-w-0 rounded-xl px-2.5 py-2 text-[11px] font-semibold leading-tight text-center transition-colors duration-150
            sm:rounded-full sm:px-3 sm:py-1 sm:text-xs
            ${
              value === "graph"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {graphLabel}
        </button>
      )}
    </div>
  );
}
