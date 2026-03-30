import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Tenant } from '@/generated/graphql';
import { Edit2, Settings, Trash2, Users } from 'lucide-react';

/**
 * Card rendering components for tenant table
 */

interface TenantCardProps {
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onViewUsers?: (tenant: Tenant) => void;
  onManageFeatures?: (tenant: Tenant) => void;
  translations: {
    active: string;
    inactive: string;
    company: string;
    email: string;
    phone: string;
    viewUsers: string;
    manageFeatures: string;
  };
}

export const useTenantCard = ({
  onEdit,
  onDelete,
  onViewUsers,
  onManageFeatures,
  translations,
}: TenantCardProps) => {
  const renderCard = (tenant: Tenant) => (
    <Card className="gap-2 overflow-hidden border py-2 shadow-none">
      {/* Custom-Header implementation - using card-header breaks ux */}
      <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
        <h3 className="text-sm leading-none font-semibold dark:text-white">
          {tenant.name}
        </h3>
        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
          {tenant.isActive ? translations.active : translations.inactive}
        </Badge>
      </div>

      <CardContent className="space-y-2 text-xs">
        {/* Company */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{translations.company}:</span>
          <span className="font-medium dark:text-gray-300">
            {tenant.companyName || '-'}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{translations.email}:</span>
          <span className="font-medium dark:text-gray-300">
            {tenant.email || '-'}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{translations.phone}:</span>
          <span className="font-medium dark:text-gray-300">
            {tenant.phone || '-'}
          </span>
        </div>
      </CardContent>

      {/* Custom-Footer implementation - using card-footer breaks ux */}
      <div className="flex items-center gap-2 border-t px-6 pt-2">
        {onViewUsers && (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onViewUsers(tenant);
            }}
            className="h-8 flex-1"
          >
            <Users className="mr-1 h-4 w-4" />
            {translations.viewUsers}
          </Button>
        )}
        {onManageFeatures && (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onManageFeatures(tenant);
            }}
            className="h-8 flex-1"
          >
            <Settings className="mr-1 h-4 w-4" />
            {translations.manageFeatures}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(tenant);
          }}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(tenant);
          }}
          className="text-destructive hover:text-destructive h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  return { renderCard };
};
