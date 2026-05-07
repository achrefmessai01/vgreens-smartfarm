'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import type { CreateHarvestMutation } from '@/generated/graphql';
import { CreateBatchFormFields } from './form/create-batch-form-fields';
import { useCreateBatchForm } from '@/lib/hooks/use-create-batch-form';

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (harvest: CreateHarvestMutation['createHarvest']) => void;
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBatchDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { formData, setFormData, errors, loading, reset, handleSubmit } =
    useCreateBatchForm({
      onSuccess: (harvest) => {
        onOpenChange(false);
        onCreated?.(harvest);
      },
    });

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) reset();
      onOpenChange(nextOpen);
    },
    [reset, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 flex w-full max-w-full flex-col gap-0 p-0 backdrop-blur-sm sm:max-w-2xl lg:max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <SheetHeader className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary-foreground/30 border-b bg-gradient-to-r px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4" />
              <Badge variant="secondary" className="text-[10px] uppercase">
                {h?.addBatchTitle || 'Add Batch'}
              </Badge>
            </div>
            <SheetTitle className="dark:text-card-foreground pr-8 text-left leading-tight break-words">
              {h?.setUpNewBatch || 'Set up a new cultivation batch'}
            </SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
            <div className="bg-card rounded-xl border p-3 shadow-sm sm:p-4">
              <CreateBatchFormFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </div>
          </div>

          <SheetFooter className="bg-background/95 dark:border-primary-foreground/30 gap-2 border-t px-4 py-4 backdrop-blur-sm sm:px-6">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full text-base font-semibold shadow-sm sm:text-lg"
              size="lg"
            >
              {loading
                ? h?.creating || 'Creating...'
                : h?.addBatchTitle || 'Add Batch'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10 w-full"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {h?.cancel || 'Cancel'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
