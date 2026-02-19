"use client";

import type { ParameterType } from "@/lib/farm-types";

interface ParameterSelectorProps {
  value: ParameterType;
  onValueChange: (value: ParameterType) => void;
  options: { label: string; value: string }[];
}

export function ParameterSelector({
  value,
  onValueChange,
  options,
}: ParameterSelectorProps) {
  return (
    <div className="flex gap-2 px-6 py-2 border-b border-border/40 bg-background">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value as ParameterType)}
            className={`
              group relative px-3 py-2 text-sm font-medium transition-colors
              ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }
            `}
          >
            {option.label}
            {/* A thinner, shorter indicator that only spans the text width */}
            <div
              className={`
                absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
                ${isActive ? "bg-primary scale-x-100" : "bg-transparent scale-x-0 group-hover:bg-muted-foreground/30 group-hover:scale-x-75"}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
