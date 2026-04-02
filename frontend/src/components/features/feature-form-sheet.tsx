'use client';

import {
  FeatureForm,
  type FeatureFormRef,
  type FeatureFormData,
} from './feature-form';
import * as React from 'react';
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetFooter,
  SheetContent,
} from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import type { Feature } from '@/generated/graphql';

interface FeatureFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
  onSubmit: (data: FeatureFormData) => void;
  isLoading?: boolean;
}

export function FeatureFormSheet({
  open,
  onOpenChange,
  feature,
  onSubmit,
  isLoading = false,
}: FeatureFormSheetProps) {
  const { t } = useI18n();
  const formRef = React.useRef<FeatureFormRef>(null);

  const handleSubmit = async (data: FeatureFormData) => {
    await onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
          <SheetTitle className="dark:text-card-foreground">
            {feature
              ? t.pages.admin.features.editTitle
              : t.pages.admin.features.createTitle}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FeatureForm
            ref={formRef}
            initialData={feature || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>

        <SheetFooter className="dark:border-primary-foreground/30 flex-row gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 flex-1"
          >
            {t.pages.users.cancel}
          </Button>
          <Button
            onClick={() => formRef.current?.submit()}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading
              ? '...'
              : feature
                ? t.pages.admin.features.updateFeature
                : t.pages.admin.features.createFeature}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
