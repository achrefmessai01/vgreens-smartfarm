'use client';

import * as React from 'react';
import { TiltCard } from './tilt-card';
import { Sparkline } from './sparkline';

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  sparklineData?: number[];
  className?: string;
}

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  sparklineData,
  className,
}: MetricCardProps) {
  return (
    <TiltCard className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {icon}
            {title}
          </h3>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="ml-4">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>
    </TiltCard>
  );
}
