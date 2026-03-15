'use client'

import type { DashboardContentProps } from './dashboard-content'

export function getDefaultDashboardContentProps(): Omit<
  DashboardContentProps,
  never
> {
  return {
    kpiItems: [
      { label: 'Farms Online', value: '5 / 5', subtitle: 'All sites reporting' },
      { label: 'Sensors Online', value: '1,248', subtitle: '98.7% uptime' },
      {
        label: 'Average Battery',
        value: '82%',
        subtitle: 'Last 24h average',
      },
      {
        label: "Today's Water Usage",
        value: '3,450 L',
        subtitle: 'Estimated',
      },
    ],
    metricCards: [
      {
        icon: '💧',
        title: 'Average Soil Moisture',
        value: '42%',
        subtitle: 'Last 24h average from sensors',
        sparklineData: [35, 40, 45, 42, 38, 42],
      },
      {
        icon: '🌡️',
        title: 'Average Air Temperature',
        value: '23°C',
        subtitle: 'Greenhouse zones',
        sparklineData: [20, 21, 22, 23, 24, 23],
      },
    ],
    progressCards: [
      {
        icon: '🌿',
        title: 'Crop Health Score',
        value: '78 / 100',
        subtitle: 'AI-based estimate',
        progressPercent: 78,
      },
      {
        icon: '📈',
        title: 'Predicted Weekly Yield',
        value: '1,200 kg',
        subtitle: 'Estimated from growth models',
        progressPercent: 0,
        secondaryBar: { percent: 65, label: 'Capacity used' },
      },
    ],
    alertCount: {
      value: '3',
      subtitle: 'Critical sensor readings',
    },
    recommendation: {
      icon: '🫧',
      title: 'Irrigation Recommendation',
      description:
        'Delay irrigation for 6 hours in Zone A. Increase drip rate in Zone C by 10%.',
    },
    devices: [
      {
        name: 'Pump #3',
        detail: 'Battery 76% · Last seen 5m ago',
        status: 'online',
      },
      {
        name: 'Sensor Cluster A',
        detail: 'Battery 62% · Last seen 12m ago',
        status: 'degraded',
      },
      {
        name: 'Valve Controller 7',
        detail: 'Battery 44% · Last seen 2h ago',
        status: 'offline',
      },
    ],
    weather: {
      icon: '☀️',
      label: 'Sunny',
      detail: '25°C · Winds 8 km/h',
    },
    trends: [
      { label: 'Soil Moisture', data: [38, 40, 42, 41, 39, 42, 43] },
      { label: 'Air Temperature', data: [22, 21, 23, 24, 23, 22, 23] },
      { label: 'Water Usage', data: [3000, 3200, 3300, 3400, 3350, 3450, 3500] },
    ],
    maintenanceItems: [
      { title: 'Pump #1 — Filter change', due: 'Due in 2 days' },
      { title: 'Valve Controller 7 — Battery replace', due: 'Due in 4 days' },
      { title: 'Sensor Cluster B — Calibration', due: 'Due in 1 week' },
    ],
    zones: [
      { name: 'Zone A', percent: 92 },
      { name: 'Zone C', percent: 85 },
      { name: 'Zone B', percent: 78 },
    ],
    syncStatusDots: [
      { label: 'Edge sync: 98%', variant: 'success' },
      { label: 'Buffered: 12 devices', variant: 'warning' },
    ],
    lastUpdated: 'Last updated: 2 minutes ago',
  }
}
