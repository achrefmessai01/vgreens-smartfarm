'use client';

import { StatCard } from './stat-card';
import { ZonesCard } from './zones-card';
import { TrendsCard } from './trends-card';
import { MetricCard } from './metric-card';
import type { ZoneItem } from './zones-card';
import { LiveMapCard } from './live-map-card';
import type { TrendItem } from './trends-card';
import { SyncStatusBar } from './sync-status-bar';
import type { StatusDot } from './sync-status-bar';
import type { KpiItem } from './dashboard-kpi-row';
import { DashboardFooter } from './dashboard-footer';
import { MaintenanceCard } from './maintenance-card';
import { DashboardKpiRow } from './dashboard-kpi-row';
import { DeviceHealthCard } from './device-health-card';
import type { MaintenanceItem } from './maintenance-card';
import { RecommendationCard } from './recommendation-card';
import { ProgressMetricCard } from './progress-metric-card';
import type { DeviceStatusItem, WeatherInfo } from './device-health-card';
import { DashboardContentSkeleton } from './dashboard-content-skeleton';

export interface DashboardContentProps {
  kpiItems: KpiItem[];
  metricCards: Array<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    sparklineData?: number[];
  }>;
  progressCards: Array<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    progressPercent: number;
    secondaryBar?: { percent: number; label: string };
  }>;
  alertCount?: { value: string; subtitle?: string };
  recommendation?: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  devices?: DeviceStatusItem[];
  weather?: WeatherInfo;
  trends?: TrendItem[];
  maintenanceItems?: MaintenanceItem[];
  zones?: ZoneItem[];
  syncStatusDots?: StatusDot[];
  lastUpdated?: string;
  onRefresh?: () => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  /** When true, shows a dashboard-shaped skeleton instead of real content. */
  loading?: boolean;
}

export function DashboardContent({
  kpiItems,
  metricCards,
  progressCards,
  alertCount,
  recommendation,
  devices = [],
  weather,
  trends = [],
  maintenanceItems = [],
  zones = [],
  syncStatusDots = [],
  lastUpdated,
  onRefresh,
  onExportCsv,
  onExportPdf,
  loading,
}: DashboardContentProps) {
  if (true) {
    return <DashboardContentSkeleton />;
  }

  return (
    <div className="space-y-6">
      <DashboardKpiRow items={kpiItems} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((m, i) => (
          <MetricCard
            key={i}
            icon={m.icon}
            title={m.title}
            value={m.value}
            subtitle={m.subtitle}
            sparklineData={m.sparklineData}
          />
        ))}
        {progressCards.map((p, i) => (
          <ProgressMetricCard
            key={i}
            icon={p.icon}
            title={p.title}
            value={p.value}
            subtitle={p.subtitle}
            progressPercent={p.progressPercent}
            secondaryBar={p.secondaryBar}
          />
        ))}
        {alertCount && (
          <StatCard
            icon={<span className="text-2xl">⚠️</span>}
            title="Active Alerts"
            value={alertCount?.value ?? ''}
            subtitle={alertCount?.subtitle}
          />
        )}
        {recommendation && (
          <RecommendationCard
            icon={recommendation?.icon ?? <span className="text-2xl">🫧</span>}
            title={recommendation?.title ?? 'Irrigation Recommendation'}
            description={
              recommendation?.description ??
              'Delay irrigation for 6 hours in Zone A. Increase drip rate in Zone C by 10%.'
            }
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LiveMapCard />
        <DeviceHealthCard devices={devices} weather={weather} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {trends.length > 0 && <TrendsCard trends={trends} />}
        {maintenanceItems.length > 0 && (
          <MaintenanceCard items={maintenanceItems} />
        )}
        {zones.length > 0 && <ZonesCard zones={zones} />}
      </div>

      {(syncStatusDots.length > 0 || onExportCsv || onExportPdf) && (
        <SyncStatusBar
          statusDots={syncStatusDots}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
        />
      )}

      <DashboardFooter lastUpdated={lastUpdated} onRefresh={onRefresh} />
    </div>
  );
}
