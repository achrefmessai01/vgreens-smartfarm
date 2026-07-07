'use client';

import * as React from 'react';
import { Pencil } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { FeatureWithTenantStatus } from '@/generated/graphql';
import { FeatureIcon } from './feature-icon';

interface FeatureToggleProps {
  feature: FeatureWithTenantStatus;
  tenantId: string;
  onToggle: (featureId: string, enabled: boolean) => void;
  isLoading?: boolean;
  // When true, the switch is rendered but non-interactive. Used for
  // VGREENS_MEMBER (read-only across the app) and tenant users — feature
  // access is a vGreens-admin-only concern.
  readOnly?: boolean;
  // Optional pencil action. The button is rendered only when the callback
  // is provided AND `readOnly` is false, so VGREENS_MEMBER and tenant users
  // don't even see the affordance. The backend enforces the same
  // VGREENS_ADMIN gate on the mutation.
  onEdit?: (feature: FeatureWithTenantStatus) => void;
}

// Card-shaped feature toggle. Enabled cards get a subtle emerald tint on the
// border + background; the icon badge, name, and status label mirror the same
// state so the whole card reads at a glance. The feature key is shown as a
// small monospaced pill at the bottom so admins can still cross-reference
// against feature-flag configs.
export function FeatureToggle({
  feature,
  onToggle,
  isLoading = false,
  readOnly = false,
  onEdit,
}: FeatureToggleProps) {
  const { t } = useI18n();
  const f = t.pages.admin.features;
  // Optional keys — read via a widened type so we can add them incrementally
  // to en.ts without breaking other locales that haven't caught up yet.
  const fRec = f as Record<string, string | undefined> & typeof f;
  const enabledStatusLabel = fRec.enabledStatus ?? 'Enabled';
  const disabledStatusLabel = fRec.disabledStatus ?? 'Disabled';
  const editFeatureLabel = fRec.editFeature ?? 'Edit feature';
  const showEditButton = !readOnly && !!onEdit;

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

  const isDisabled = isLoading || !feature.isActive || readOnly;

  return (
    <div
      className={cn(
        // Card frame — more generous padding than a compact list item so
        // the icon + name + description have room to breathe. Enabled
        // cards get an emerald outline + faint tint so the whole card
        // reads at a glance without needing to scan for the toggle.
        // Enabled cards get a full-opacity emerald outline (was /60) so
        // the "this feature is on" signal reads from across the grid,
        // matching the design mock. A soft emerald ring layered on top
        // gives the border a slight glow on both themes without needing
        // to jump the border-width and reflow neighbouring cards.
        'group bg-card relative flex flex-col rounded-2xl border p-5 transition-colors sm:p-6',
        enabled
          ? 'border-emerald-500 bg-emerald-500/[0.03] shadow-[0_0_0_1px_theme(colors.emerald.500/0.35)] hover:bg-emerald-500/[0.06]'
          : 'border-border/60 hover:bg-muted/30',
      )}
    >
      {/* Top row: icon badge (left) + pencil + switch (right). Pencil is
          only rendered for VGREENS_ADMIN — the backend enforces the same. */}
      <div className="flex items-start justify-between gap-3">
        <FeatureIcon featureKey={feature.key} enabled={enabled} />
        <div className="flex items-center gap-1.5">
          {showEditButton && (
            <button
              type="button"
              onClick={() => onEdit?.(feature)}
              aria-label={`${editFeatureLabel}: ${feature.name}`}
              title={editFeatureLabel}
              className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          )}
          <Switch
            id={`feature-${feature.id}`}
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isDisabled}
            className={cn('transition-opacity', isDisabled && 'opacity-40')}
            aria-label={feature.name}
          />
        </div>
      </div>

      {/* Body: name + description. `flex-1` makes this section grow to
          fill any extra card height the grid hands us — cards without a
          description would otherwise be shorter, and the divider below
          would sit at different vertical positions from row to row. */}
      <div className="mt-5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-base font-semibold transition-colors',
              enabled ? 'text-foreground' : 'text-foreground/90',
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
          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
            {feature.description}
          </p>
        )}
      </div>

      {/* Footer: horizontal divider then key pill (left) + status label
          (right). The divider stays neutral even on enabled cards so it
          doesn't compete with the outer emerald outline. */}
      <div className="border-border/60 mt-5 flex items-center justify-between gap-2 border-t pt-4">
        <span className="bg-muted/60 text-muted-foreground max-w-[70%] truncate rounded px-2 py-1 font-mono text-xs">
          {feature.key}
        </span>
        <span
          className={cn(
            'text-sm font-medium',
            enabled ? 'text-emerald-500' : 'text-muted-foreground',
          )}
        >
          {enabled ? enabledStatusLabel : disabledStatusLabel}
        </span>
      </div>
    </div>
  );
}
