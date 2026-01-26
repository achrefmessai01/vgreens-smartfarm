'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Feature } from '@/generated/graphql'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export interface FeatureFormData {
  key: string
  name: string
  description?: string
  category?: string
  isActive: boolean
}

export interface FeatureFormRef {
  submit: () => void
}

interface FeatureFormProps {
  ref?: React.Ref<FeatureFormRef>
  initialData?: Feature
  onSubmit: (data: FeatureFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export const FeatureForm = React.forwardRef<FeatureFormRef, FeatureFormProps>(
  ({ initialData, onSubmit, onCancel, isLoading = false }, ref) => {
    const { t } = useI18n()
    const [formData, setFormData] = React.useState<FeatureFormData>({
      key: initialData?.key || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      isActive: initialData?.isActive ?? true,
    })

    React.useEffect(() => {
      if (initialData) {
        setFormData({
          key: initialData.key,
          name: initialData.name,
          description: initialData.description || '',
          category: initialData.category || '',
          isActive: initialData.isActive,
        })
      }
    }, [initialData])

    React.useImperativeHandle(ref, () => ({
      submit: () => {
        if (formData.key && formData.name) {
          onSubmit(formData)
        }
      },
    }))

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (formData.key && formData.name) {
        onSubmit(formData)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="key">{t.pages.admin.features.keyRequired}</Label>
          <Input
            id="key"
            value={formData.key}
            onChange={(e) =>
              setFormData({
                ...formData,
                key: e.target.value.toLowerCase().replace(/\s+/g, '_'),
              })
            }
            placeholder={t.pages.admin.features.keyPlaceholder}
            required
            disabled={isLoading || !!initialData}
            className="dark:bg-input/30"
          />
          <p className="text-xs text-muted-foreground">
            {t.pages.admin.features.keyDescription}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">{t.pages.admin.features.nameRequired}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t.pages.admin.features.namePlaceholder}
            required
            disabled={isLoading}
            className="dark:bg-input/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {t.pages.admin.features.descriptionLabel}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder={t.pages.admin.features.descriptionPlaceholder}
            rows={3}
            disabled={isLoading}
            className="dark:bg-input/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            {t.pages.admin.features.categoryLabel}
          </Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder={t.pages.admin.features.categoryPlaceholder}
            disabled={isLoading}
            className="dark:bg-input/30"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked === true })
            }
            disabled={isLoading}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            {t.pages.admin.features.isActiveLabel}
          </Label>
        </div>
      </form>
    )
  }
)

FeatureForm.displayName = 'FeatureForm'
