import * as React from 'react';

export interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  name?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export interface ChartDotProps {
  cx?: number;
  cy?: number;
  fill: string;
  stroke: string;
}

export function ChartTooltipContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
      {children}
    </div>
  );
}

export function ChartDot({ cx = 0, cy = 0, fill, stroke }: ChartDotProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      className="cursor-pointer transition-all duration-200"
      style={{ filter: `drop-shadow(0 4px 6px ${fill}66)` }}
    />
  );
}
