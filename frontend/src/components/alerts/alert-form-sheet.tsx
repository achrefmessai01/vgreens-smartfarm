'use client';

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
import type { Alert } from '@/generated/graphql';
import { AlertForm, type AlertFormRef } from './alert-form';

interface AlertFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onSubmit: (data: {
    sensorName: string;
    value: string;
    description?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AlertFormSheet({
  open,
  onOpenChange,
  alert,
  onSubmit,
  onCancel,
  isLoading = false,
}: AlertFormSheetProps) {
  const { t } = useI18n();
  const formRef = React.useRef<AlertFormRef>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
      >
        <SheetHeader className="dark:border-primary-foreground/30 border-b px-6 pt-6 pb-4">
          <SheetTitle className="dark:text-card-foreground">
            {alert ? t.pages.alerts.editAlert : t.pages.alerts.createAlert}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AlertForm
            ref={formRef}
            initialData={alert || undefined}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </div>
        <SheetFooter className="dark:border-primary-foreground/30 flex-row gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 flex-1"
          >
            {t.pages.alerts.cancel}
          </Button>
          <Button
            onClick={() => formRef.current?.submit()}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading
              ? '...'
              : alert
                ? t.pages.alerts.updateAlert
                : t.pages.alerts.createAlert}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
