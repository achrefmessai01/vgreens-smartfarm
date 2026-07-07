'use client';

import type { Feature } from '@/generated/graphql';
import { FeatureGridCard, type FeatureCardTranslations } from './feature-grid-card';

interface FeatureGridViewTranslations extends FeatureCardTranslations {
  noResults: string;
  noResultsDescription: string;
}

interface FeatureGridViewProps {
  features: Feature[];
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  isLoading?: boolean;
  translations: FeatureGridViewTranslations;
}

/**
 * Responsive grid of `FeatureGridCard`s. Single column on mobile, two on
 * `sm`, three on `xl` — same rhythm as `UserGridView`. Renders a small
 * empty-state card when the filtered list is empty so the surface never
 * silently disappears.
 */
export function FeatureGridView({
  features,
  onEdit,
  onDelete,
  isLoading = false,
  translations,
}: FeatureGridViewProps) {
  if (features.length === 0) {
    return (
      <div className="border-border/60 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">{translations.noResults}</p>
        <p className="text-muted-foreground text-xs">
          {translations.noResultsDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => (
        <FeatureGridCard
          key={feature.id}
          feature={feature}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          translations={translations}
        />
      ))}
    </div>
  );
}
