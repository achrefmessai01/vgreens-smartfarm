'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { FeatureToggle, type FeatureSubToggle } from './feature-toggle';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { FeatureWithTenantStatus } from '@/generated/graphql';

interface FeatureListProps {
  features: FeatureWithTenantStatus[];
  tenantId: string;
  onToggle: (featureId: string, enabled: boolean) => void;
  isLoading?: boolean;
  // Non-admins (VGREENS_MEMBER, tenant users) see the panel but can't
  // toggle. The server enforces the same check on the mutation.
  readOnly?: boolean;
  // Optional pencil edit action. Passed through to each card; the pencil
  // is only rendered when this callback is provided and `readOnly` is
  // false (VGREENS_ADMIN only in practice).
  onEdit?: (feature: FeatureWithTenantStatus) => void;
  // Per-feature secondary switch (e.g. tenant-admin access for
  // device_status). Return undefined for features without one.
  getSubToggle?: (
    feature: FeatureWithTenantStatus,
  ) => FeatureSubToggle | undefined;
}

type StatusFilter = 'all' | 'on' | 'off';

// Feature Access panel:
//   ┌───────────────────────────────────────────────┐
//   │ Feature Access                        4 / 9   │
//   │ subtitle…                           enabled   │
//   │ ┌──────────────────────┐  ┌─────┬─────┬────┐  │
//   │ │ 🔍 Search…           │  │ All │ On  │ Off│  │
//   │ └──────────────────────┘  └─────┴─────┴────┘  │
//   │ ┌────────┐ ┌────────┐                          │
//   │ │  card  │ │  card  │  … 2-col responsive grid │
//   │ └────────┘ └────────┘                          │
//   └───────────────────────────────────────────────┘
//
// Search matches feature name + key + description (all case-insensitive), so
// admins can look up a flag by any of the labels they're familiar with. The
// segmented filter is client-only — the underlying list is short enough that
// filtering in the browser is cheaper than another network round-trip.
export function FeatureList({
  features,
  tenantId,
  onToggle,
  isLoading = false,
  readOnly = false,
  onEdit,
  getSubToggle,
}: FeatureListProps) {
  const { t } = useI18n();
  const f = t.pages.admin.features;
  // Optional keys — read via a widened type so we can add them incrementally
  // to en.ts without breaking other locales that haven't caught up yet.
  const fRec = f as Record<string, string | undefined> & typeof f;
  const searchLabel = fRec.searchFeatures ?? 'Search features';
  const searchPlaceholder =
    fRec.searchFeaturesPlaceholder ?? 'Search features...';
  const filterAllLabel = fRec.filterAll ?? 'All';
  const filterOnLabel = fRec.filterOn ?? 'On';
  const filterOffLabel = fRec.filterOff ?? 'Off';
  const noMatchesLabel =
    fRec.noFeaturesMatch ?? 'No features match your filters.';

  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');

  const enabledCount = React.useMemo(
    () => features.filter((feat) => feat.enabledForTenant).length,
    [features],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return features.filter((feat) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'on' && feat.enabledForTenant) ||
        (status === 'off' && !feat.enabledForTenant);
      if (!matchesStatus) return false;

      if (!q) return true;
      const inName = feat.name.toLowerCase().includes(q);
      const inKey = feat.key.toLowerCase().includes(q);
      const inDesc = (feat.description ?? '').toLowerCase().includes(q);
      return inName || inKey || inDesc;
    });
  }, [features, search, status]);

  if (features.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        {f.noFeaturesAvailable}
      </div>
    );
  }

  return (
    <div className="bg-card border-border/60 flex flex-col gap-4 rounded-xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{f.featureAccess}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {f.manageFeaturesSubtitle}
          </p>
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-2xl font-semibold tabular-nums">
            {enabledCount}
            <span className="text-muted-foreground text-lg font-normal">
              {' '}
              /{features.length}
            </span>
          </span>
          <span className="text-xs font-medium text-emerald-500">
            {f.enabled}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="h-9 pl-8"
          />
        </div>
        <div
          role="tablist"
          aria-label={f.status}
          className="bg-muted/60 inline-flex shrink-0 items-center rounded-md p-0.5 text-xs"
        >
          <SegmentButton
            active={status === 'all'}
            onClick={() => setStatus('all')}
          >
            {filterAllLabel}
          </SegmentButton>
          <SegmentButton
            active={status === 'on'}
            onClick={() => setStatus('on')}
          >
            {filterOnLabel}
          </SegmentButton>
          <SegmentButton
            active={status === 'off'}
            onClick={() => setStatus('off')}
          >
            {filterOffLabel}
          </SegmentButton>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center text-sm">
          {noMatchesLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1201px]:grid-cols-3">
          {filtered.map((feature) => (
            <FeatureToggle
              key={feature.id}
              feature={feature}
              tenantId={tenantId}
              onToggle={onToggle}
              isLoading={isLoading}
              readOnly={readOnly}
              onEdit={onEdit}
              subToggle={getSubToggle?.(feature)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SegmentButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SegmentButton({ active, onClick, children }: SegmentButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-[5px] px-3 py-1 font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
