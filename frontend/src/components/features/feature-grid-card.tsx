'use client';

import { Card, CardContent } from '@/components/ui/card';
import { WriteActionButton } from '@/components/ui/write-action-button';
import type { Feature } from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { FeatureCategoryBadge } from './feature-category-badge';
import { FeatureIcon } from './feature-icon';
import { FeatureStatusPill } from './feature-status-pill';

export interface FeatureCardTranslations {
  active: string;
  inactive: string;
  edit: string;
  delete: string;
  noDescription: string;
  uncategorized: string;
}

interface FeatureGridCardProps {
  feature: Feature;
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  onClick?: (feature: Feature) => void;
  isLoading?: boolean;
  translations: FeatureCardTranslations;
}

/**
 * Single feature card for the grid view. Presentational only — takes a
 * feature + translation record + action callbacks and renders the icon +
 * name/key + status pill + description body + category/actions footer.
 * State lives in the parent. Mirrors `UserGridCard`.
 */
export function FeatureGridCard({
  feature,
  onEdit,
  onDelete,
  onClick,
  isLoading = false,
  translations,
}: FeatureGridCardProps) {
  const description = feature.description?.trim() || '';

  return (
    <Card
      onClick={onClick ? () => onClick(feature) : undefined}
      className={cn(
        'border-border/60 flex flex-col gap-3 p-4 shadow-none transition-colors',
        onClick && 'hover:border-border cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <FeatureIcon featureKey={feature.key} enabled={feature.isActive} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight">
              {feature.name}
            </span>
            <span className="text-muted-foreground truncate font-mono text-xs">
              {feature.key}
            </span>
          </div>
        </div>
        <FeatureStatusPill
          isActive={feature.isActive}
          activeLabel={translations.active}
          inactiveLabel={translations.inactive}
        />
      </div>

      <CardContent className="p-0 text-xs">
        <p
          className={cn(
            'line-clamp-2 min-h-[2.5rem] text-sm leading-snug',
            description ? 'text-muted-foreground' : 'text-muted-foreground/70 italic',
          )}
        >
          {description || translations.noDescription}
        </p>
      </CardContent>

      <div className="border-border/60 flex items-center gap-2 border-t pt-3">
        <FeatureCategoryBadge
          category={feature.category}
          uncategorizedLabel={translations.uncategorized}
        />
        <div className="ml-auto flex items-center gap-1">
          <WriteActionButton
            variant="ghost"
            size="icon"
            aria-label={translations.edit}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(feature);
            }}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Edit2 className="h-4 w-4" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="icon"
            aria-label={translations.delete}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(feature);
            }}
            className="text-destructive hover:text-destructive h-8 w-8"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </WriteActionButton>
        </div>
      </div>
    </Card>
  );
}
