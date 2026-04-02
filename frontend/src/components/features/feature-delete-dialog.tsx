'use client';

import { useI18n } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import type { Feature } from '@/generated/graphql';
import { ConfirmationDialog } from '@/components/users';

interface FeatureDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
  onConfirm: () => void;
}

export function FeatureDeleteDialog({
  open,
  onOpenChange,
  feature,
  onConfirm,
}: FeatureDeleteDialogProps) {
  const { t } = useI18n();
  if (!feature) return null;

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.pages.admin.features.deleteTitle}
      description={t.pages.admin.features.deleteDescription}
      confirmLabel={t.pages.admin.features.deleteConfirm}
      cancelLabel={t.pages.admin.features.deleteCancel}
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={() => onOpenChange(false)}
    >
      <div className="space-y-4">
        <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
          <div className="mb-2 flex items-center justify-between">
            <p className="dark:text-card-foreground font-medium">
              {feature.name}
            </p>
            <Badge variant={feature.isActive ? 'default' : 'secondary'}>
              {feature.isActive
                ? t.pages.admin.features.active
                : t.pages.admin.features.inactive}
            </Badge>
          </div>
          <p className="text-muted-foreground dark:text-muted-foreground/80 mt-1 font-mono text-sm">
            {feature.key}
          </p>
          {feature.description && (
            <p className="text-muted-foreground dark:text-muted-foreground/80 mt-2 text-sm">
              {feature.description}
            </p>
          )}
          {feature.category && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {feature.category}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </ConfirmationDialog>
  );
}
