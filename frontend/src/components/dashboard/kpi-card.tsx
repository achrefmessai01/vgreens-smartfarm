'use client';

import { cn } from '@/lib/utils';

export interface KpiCardProps {
  label: string;
  value: string;
  subtitle?: string;
  className?: string;
}

export function KpiCard({ label, value, subtitle, className }: KpiCardProps) {
  return (
    <div
      className={cn('bg-card flex flex-col rounded-lg border p-4', className)}
    >
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-muted-foreground mt-1 text-xs">{subtitle}</div>
      )}
    </div>
  );
}
