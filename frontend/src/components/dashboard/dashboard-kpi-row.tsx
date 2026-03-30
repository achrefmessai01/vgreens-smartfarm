'use client';

import { KpiCard } from './kpi-card';

export interface KpiItem {
  label: string;
  value: string;
  subtitle?: string;
}

export interface DashboardKpiRowProps {
  items: KpiItem[];
  className?: string;
}

export function DashboardKpiRow({ items, className }: DashboardKpiRowProps) {
  return (
    <div className={className ?? 'grid grid-cols-2 gap-4 md:grid-cols-4'}>
      {items.map((item, i) => (
        <KpiCard
          key={i}
          label={item.label}
          value={item.value}
          subtitle={item.subtitle}
        />
      ))}
    </div>
  );
}
