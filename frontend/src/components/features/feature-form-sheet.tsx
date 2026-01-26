'use client'

import {
  FeatureForm,
  type FeatureFormRef,
  type FeatureFormData,
} from './feature-form'
import * as React from 'react'
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetFooter,
  SheetContent,
} from '@/components/ui/sheet'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import type { Feature } from '@/generated/graphql'

interface FeatureFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: Feature | null
  onSubmit: (data: FeatureFormData) => void
  isLoading?: boolean
}

export function FeatureFormSheet({
  open,
  onOpenChange,
  feature,
  onSubmit,
  isLoading = false,
}: FeatureFormSheetProps) {
  const { t } = useI18n()
  const formRef = React.useRef<FeatureFormRef>(null)

  const handleSubmit = async (data: FeatureFormData) => {
    await onSubmit(data)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
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

        <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
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
  )
}
