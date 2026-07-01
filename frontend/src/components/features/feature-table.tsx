'use client';

import { Badge } from '@/components/ui/badge';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { TableCell } from '@/components/ui/table';
import type { Feature } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface FeatureTableProps {
  features: Feature[];
  onEdit: (feature: Feature) => void;
  onDelete: (feature: Feature) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

export function FeatureTable({
  features,
  onEdit,
  onDelete,
  onCreate,
  isLoading = false,
}: FeatureTableProps) {
  const { t } = useI18n();
  const paginationConfig = usePaginationConfig();
  const { isMobile } = useResponsiveBreakpoint('lg');
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
  ];

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
        <p className="text-muted-foreground truncate text-sm">
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
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={() => onEdit(feature)}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Edit2 className="h-4 w-4" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={() => onDelete(feature)}
            className="text-destructive hover:text-destructive h-8 w-8"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </WriteActionButton>
        </div>
      </TableCell>
    </>
  );

  const renderCard = (feature: Feature) => (
    <Card className="gap-2 overflow-hidden border py-2 shadow-none">
      {/* Custom-Header implementation - using card-header breaks ux */}
      <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
        <h3 className="text-sm leading-none font-semibold">{feature.name}</h3>
        {/* Status */}
        <Badge
          variant={feature.isActive ? 'default' : 'secondary'}
          className="h-5 text-xs"
        >
          {feature.isActive
            ? t.pages.admin.features.active
            : t.pages.admin.features.inactive}
        </Badge>
      </div>

      <CardContent className="space-y-2 text-xs">
        {/* Key */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t.pages.admin.features.key}:
          </span>
          <span className="font-mono font-medium break-all">{feature.key}</span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t.pages.admin.features.category}:
          </span>
          {feature.category ? (
            <Badge variant="outline" className="h-5 text-xs">
              {feature.category}
            </Badge>
          ) : (
            <span className="font-medium">-</span>
          )}
        </div>

        {/* Description */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t.pages.admin.features.description}:
          </span>
          <span className="font-medium">{feature.description || '-'}</span>
        </div>
      </CardContent>

      {/* Custom-Footer implementation */}
      <div className="flex items-center border-t px-6 pt-2">
        <div className="flex gap-2">
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={() => onEdit(feature)}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Edit2 className="h-4 w-4" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={() => onDelete(feature)}
            className="text-destructive hover:text-destructive h-8 w-8"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </WriteActionButton>
        </div>
      </div>
    </Card>
  );

  return (
    <div
      className={
        isMobile ? 'flex flex-col gap-4' : 'flex h-full min-h-0 flex-col gap-4'
      }
    >
      {onCreate ? (
        <div className="flex justify-end">
          <WriteActionButton onClick={onCreate} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            {t.pages.admin.features.createFeature}
          </WriteActionButton>
        </div>
      ) : null}
      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
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
    </div>
  );
}
