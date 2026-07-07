'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WriteActionButton } from '@/components/ui/write-action-button';
import type { TenantData } from '@/lib/graphql-compat';
import { cn } from '@/lib/utils';
import { Edit2, Mail, Phone, PhoneOff, Settings, Trash2 } from 'lucide-react';
import { TenantAvatar } from './tenant-avatar';

interface TenantGridCardTranslations {
  active: string;
  inactive: string;
  configure: string;
  noPhone: string;
  edit: string;
  delete: string;
}

interface TenantGridCardProps {
  tenant: TenantData;
  onEdit: (tenant: TenantData) => void;
  onDelete: (tenant: TenantData) => void;
  onManageFeatures?: (tenant: TenantData) => void;
  onClick?: (tenant: TenantData) => void;
  translations: TenantGridCardTranslations;
}

/**
 * Single tenant card for the grid view. Kept presentational: takes a
 * tenant + a small translation record + action callbacks, renders the
 * avatar + status + contact rows + footer buttons. All state lives in
 * the parent.
 */
export function TenantGridCard({
  tenant,
  onEdit,
  onDelete,
  onManageFeatures,
  onClick,
  translations,
}: TenantGridCardProps) {
  const isActive = tenant.isActive ?? true;

  return (
    <Card
      onClick={onClick ? () => onClick(tenant) : undefined}
      className={cn(
        'border-border/60 flex flex-col gap-3 p-4 shadow-none transition-colors',
        onClick && 'hover:border-border cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <TenantAvatar tenantId={tenant.id} name={tenant.name} size="md" />
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
      </div>

      <CardContent className="flex flex-col gap-1.5 p-0 text-xs">
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
      </CardContent>

      <div className="border-border/60 flex items-center gap-2 border-t pt-3">
        {onManageFeatures ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onManageFeatures(tenant);
            }}
            className="h-8 gap-1.5 rounded-md text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            {translations.configure}
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-1">
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
      </div>
    </Card>
  );
}
