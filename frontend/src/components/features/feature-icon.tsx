'use client';

import * as React from 'react';
import {
  Bell,
  Camera,
  LayoutGrid,
  LineChart,
  type LucideIcon,
  Map,
  Puzzle,
  Server,
  Snowflake,
  Sprout,
  Users,
} from 'lucide-react';

// Feature-key → icon lookup. Kept in one place so both the grid card and any
// future feature UI (e.g. an "upcoming features" preview) can share it.
// Unknown keys fall back to the generic `Puzzle` icon.
const ICON_BY_KEY: Record<string, LucideIcon> = {
  dashboard: LayoutGrid,
  farm_overview: Map,
  device_status: Server,
  data_analytics: LineChart,
  cold_hours: Snowflake,
  harvest_management: Sprout,
  camera_livestream: Camera,
  sensor_alerts: Bell,
  user_management: Users,
};

export function getFeatureIcon(key: string): LucideIcon {
  return ICON_BY_KEY[key] ?? Puzzle;
}

interface FeatureIconProps {
  featureKey: string;
  enabled: boolean;
}

// Small square badge with the icon, tinted by enabled state.
//
// `getFeatureIcon` returns a component reference, not a JSX element. We
// render it with `React.createElement` rather than binding it to a local
// PascalCase variable — the `react-hooks/static-components` lint rule
// forbids the `const Icon = getFeatureIcon(...)` shortcut because a
// linter can't statically verify the returned component is stable.
export function FeatureIcon({ featureKey, enabled }: FeatureIconProps) {
  return (
    <div
      className={
        enabled
          ? 'bg-emerald-500/15 text-emerald-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'
          : 'bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'
      }
    >
      {React.createElement(getFeatureIcon(featureKey), {
        className: 'h-[18px] w-[18px]',
        'aria-hidden': true,
      })}
    </div>
  );
}
