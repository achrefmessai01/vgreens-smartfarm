'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { FeatureWithTenantStatus } from '@/generated/graphql';

interface FeatureToggleProps {
  feature: FeatureWithTenantStatus;
  tenantId: string;
  onToggle: (featureId: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export function FeatureToggle({
  feature,
  onToggle,
  isLoading = false,
}: FeatureToggleProps) {
  const { t } = useI18n();
  const f = t.pages.admin.features;

  const [enabled, setEnabled] = React.useState(
    feature.enabledForTenant || false,
  );

  React.useEffect(() => {
    setEnabled(feature.enabledForTenant || false);
  }, [feature.enabledForTenant]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    onToggle(feature.id, checked);
  };

  const isDisabled = isLoading || !feature.isActive;

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors',
        enabled ? 'hover:bg-emerald-500/5' : 'hover:bg-muted/30',
      )}
    >
      <div
        className={cn(
          'h-8 w-1 shrink-0 rounded-full transition-colors',
          enabled ? 'bg-emerald-500' : 'bg-border',
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              enabled ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {feature.name}
          </span>
          {!feature.isActive && (
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
              {f.inactive}
            </span>
          )}
        </div>
        {feature.description && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {feature.description}
          </p>
        )}
        <p className="text-muted-foreground/50 mt-1 font-mono text-[10px]">
          {feature.key}
        </p>
      </div>

      <Switch
        id={`feature-${feature.id}`}
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isDisabled}
        className={cn('transition-opacity', isDisabled && 'opacity-40')}
      />
    </div>
  );
}
