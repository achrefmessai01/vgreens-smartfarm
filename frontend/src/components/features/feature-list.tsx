'use client';

import * as React from 'react';
import { FeatureToggle } from './feature-toggle';
import { useI18n } from '@/i18n';
import type { FeatureWithTenantStatus } from '@/generated/graphql';

interface FeatureListProps {
  features: FeatureWithTenantStatus[];
  tenantId: string;
  onToggle: (featureId: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export function FeatureList({
  features,
  tenantId,
  onToggle,
  isLoading = false,
}: FeatureListProps) {
  const { t } = useI18n();
  const f = t.pages.admin.features;

  const enabledCount = features.filter((feat) => feat.enabledForTenant).length;

  if (features.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        {f.noFeaturesAvailable}
      </div>
    );
  }

  return (
    <div className="bg-card border-border/60 overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold">{f.featureAccess}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {f.manageFeaturesSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            {enabledCount} {f.enabled}
          </span>
          <span className="text-muted-foreground text-xs">
            {f.of} {features.length}
          </span>
        </div>
      </div>

      <div className="divide-border/40 divide-y">
        {features.map((feature) => (
          <FeatureToggle
            key={feature.id}
            feature={feature}
            tenantId={tenantId}
            onToggle={onToggle}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
