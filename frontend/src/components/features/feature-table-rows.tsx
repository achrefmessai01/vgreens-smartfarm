import { TableCell } from '@/components/ui/table';
import { WriteActionButton } from '@/components/ui/write-action-button';
import type { Feature } from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { FeatureCategoryBadge } from './feature-category-badge';
import {
  FeatureGridCard,
  type FeatureCardTranslations,
} from './feature-grid-card';
import { FeatureIcon } from './feature-icon';
import { FeatureStatusPill } from './feature-status-pill';

interface UseFeatureRowArgs {
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  isLoading?: boolean;
  translations: FeatureCardTranslations;
}

/**
 * Row + card renderers for the feature-flags list view. Desktop renders
 * the redesigned FLAG / CATEGORY / DESCRIPTION / STATUS / ACTIONS shape;
 * narrow viewports drop down to the shared `FeatureGridCard` so we don't
 * duplicate card markup between "list on narrow" and "grid view".
 * Mirrors `useUserManagementRow`.
 */
export const useFeatureTableRow = ({
  onEdit,
  onDelete,
  isLoading = false,
  translations,
}: UseFeatureRowArgs) => {
  const renderRow = (feature: Feature) => {
    const description = feature.description?.trim() || '';

    return (
      <>
        <TableCell className="min-w-[240px] font-medium">
          <div className="flex items-center gap-3">
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
        </TableCell>
        <TableCell>
          <FeatureCategoryBadge
            category={feature.category}
            uncategorizedLabel={translations.uncategorized}
          />
        </TableCell>
        <TableCell className="max-w-md">
          <p
            className={cn(
              'truncate text-sm',
              description ? 'text-foreground' : 'text-muted-foreground/70 italic',
            )}
          >
            {description || translations.noDescription}
          </p>
        </TableCell>
        <TableCell>
          <FeatureStatusPill
            isActive={feature.isActive}
            activeLabel={translations.active}
            inactiveLabel={translations.inactive}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
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
        </TableCell>
      </>
    );
  };

  const renderCard = (feature: Feature) => (
    <FeatureGridCard
      feature={feature}
      onEdit={onEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      translations={translations}
    />
  );

  return { renderRow, renderCard };
};
