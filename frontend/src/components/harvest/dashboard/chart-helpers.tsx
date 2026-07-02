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

interface ChartTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Bottom margin applied to the whole title block. Some charts need extra
   * breathing room before the plot area, so callers can override the default. */
  className?: string;
}

// Renders the standard chart heading, optionally with a muted subtitle line
// below (used in compare mode to surface the shared crop name).
export function ChartTitle({
  title,
  subtitle,
  className = 'mb-4',
}: ChartTitleProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && (
        <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
      )}
    </div>
  );
}
