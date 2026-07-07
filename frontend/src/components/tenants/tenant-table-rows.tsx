import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { TableCell } from '@/components/ui/table';
import type { TenantData } from '@/lib/graphql-compat';
import { cn } from '@/lib/utils';
import { Edit2, Mail, Phone, PhoneOff, Settings, Trash2 } from 'lucide-react';
import { TenantAvatar } from './tenant-avatar';
import { TenantGridCard } from './tenant-grid-card';

interface TenantRowTranslations {
  active: string;
  inactive: string;
  configure: string;
  noPhone: string;
  edit: string;
  delete: string;
}

interface UseTenantRowArgs {
  onEdit: (tenant: TenantData) => void;
  onDelete: (tenant: TenantData) => void;
  onManageFeatures?: (tenant: TenantData) => void;
  onCardClick?: (tenant: TenantData) => void;
  translations: TenantRowTranslations;
}

/**
 * Row + card renderers for the tenants list view. Desktop renders the
 * redesigned TENANT / CONTACT / STATUS / ACTIONS shape; mobile drops down
 * to the shared `TenantGridCard` so we don't duplicate card markup between
 * "list on narrow" and "grid view".
 */
export const useTenantRow = ({
  onEdit,
  onDelete,
  onManageFeatures,
  onCardClick,
  translations,
}: UseTenantRowArgs) => {
  const renderRow = (tenant: TenantData) => {
    const isActive = tenant.isActive ?? true;
    return (
      <>
        <TableCell className="min-w-[220px] font-medium">
          <div className="flex items-center gap-3">
            <TenantAvatar tenantId={tenant.id} name={tenant.name} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                {tenant.name}
              </span>
              {tenant.companyName ? (
                <span className="text-muted-foreground text-xs">
                  {tenant.companyName}
                </span>
              ) : null}
            </div>
          </div>
        </TableCell>
        <TableCell className="min-w-[260px]">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tenant.email || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              {tenant.phone ? (
                <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              ) : (
                <PhoneOff className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
              )}
              <span
                className={cn(
                  tenant.phone
                    ? 'text-foreground'
                    : 'text-muted-foreground/70 italic',
                )}
              >
                {tenant.phone || translations.noPhone}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn(
              'gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
              isActive &&
                'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
            )}
          >
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                isActive ? 'bg-emerald-400' : 'bg-muted-foreground',
              )}
            />
            {isActive ? translations.active : translations.inactive}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            {onManageFeatures ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={translations.configure}
                onClick={(event) => {
                  event.stopPropagation();
                  onManageFeatures(tenant);
                }}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : null}
            <WriteActionButton
              variant="ghost"
              size="icon"
              aria-label={translations.edit}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(tenant);
              }}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </WriteActionButton>
            <WriteActionButton
              variant="ghost"
              size="icon"
              aria-label={translations.delete}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(tenant);
              }}
              className="text-destructive hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </WriteActionButton>
          </div>
        </TableCell>
      </>
    );
  };

  const renderCard = (tenant: TenantData) => (
    <TenantGridCard
      tenant={tenant}
      onEdit={onEdit}
      onDelete={onDelete}
      onManageFeatures={onManageFeatures}
      onClick={onCardClick}
      translations={translations}
    />
  );

  return { renderRow, renderCard };
};
