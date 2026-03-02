'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import type { Feature } from '@/generated/graphql'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface FeatureTableProps {
  features: Feature[]
  onEdit: (feature: Feature) => void
  onDelete: (feature: Feature) => void
  onCreate: () => void
  isLoading?: boolean
}

export function FeatureTable({
  features,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
}: FeatureTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()
  const columns: Column<Feature>[] = [
    {
      key: 'key',
      header: t.pages.admin.features.key,
    },
    {
      key: 'name',
      header: t.pages.admin.features.name,
    },
    {
      key: 'category',
      header: t.pages.admin.features.category,
    },
    {
      key: 'description',
      header: t.pages.admin.features.description,
    },
    {
      key: 'isActive',
      header: t.pages.admin.features.status,
    },
    {
      key: 'actions',
      header: t.pages.admin.features.actions,
      headerClassName: 'text-right',
    },
  ]

  const renderRow = (feature: Feature) => (
    <>
      <TableCell className="font-mono text-sm">{feature.key}</TableCell>
      <TableCell className="font-medium">{feature.name}</TableCell>
      <TableCell>
        {feature.category ? (
          <Badge variant="outline">{feature.category}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="max-w-md">
        <p className="text-sm text-muted-foreground truncate">
          {feature.description || '-'}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={feature.isActive ? 'default' : 'secondary'}>
          {feature.isActive
            ? t.pages.admin.features.active
            : t.pages.admin.features.inactive}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(feature)}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(feature)}
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  )

  const renderCard = (feature: Feature) => (
    <Card className="gap-0 overflow-hidden border border-border/60 py-0 shadow-none">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold">{feature.name}</p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              {feature.key}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {feature.category ? (
              <Badge variant="outline">{feature.category}</Badge>
            ) : null}
            <Badge variant={feature.isActive ? 'default' : 'secondary'}>
              {feature.isActive
                ? t.pages.admin.features.active
                : t.pages.admin.features.inactive}
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t.pages.admin.features.description}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {feature.description || '-'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-border/50 px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(feature)}
          className="h-8 w-8"
          disabled={isLoading}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(feature)}
          className="h-8 w-8 text-destructive hover:text-destructive"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreate} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {t.pages.admin.features.createFeature}
        </Button>
      </div>
      <DataTable
        data={features}
        columns={columns}
        renderRow={renderRow}
        renderCard={renderCard}
        paginationVariant="compact"
        defaultPageSize={paginationConfig.defaultPageSize}
        pageSizeOptions={paginationConfig.pageSizeOptions}
        paginationLabels={paginationConfig.paginationLabels}
        responsiveBreakpoint="xl"
      />
    </div>
  )
}
