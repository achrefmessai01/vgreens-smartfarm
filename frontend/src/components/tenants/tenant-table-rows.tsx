import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { TableCell } from '@/components/ui/table';
import type { Tenant } from '@/generated/graphql';
import { Edit2, Settings, Trash2, Users } from 'lucide-react';
import { useTenantCard } from './tenant-table-cards';

/**
 * Row rendering components for tenant table
 */

interface TenantRowProps {
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

export const useTenantRow = ({
  onEdit,
  onDelete,
  onViewUsers,
  onManageFeatures,
  translations,
}: TenantRowProps) => {
  // Get card renderer from dedicated card module
  const { renderCard } = useTenantCard({
    onEdit,
    onDelete,
    onViewUsers,
    onManageFeatures,
    translations,
  });

  const renderRow = (tenant: Tenant) => (
    <>
      <TableCell className="font-medium">{tenant.name}</TableCell>
      <TableCell>{tenant.companyName || '-'}</TableCell>
      <TableCell>{tenant.email || '-'}</TableCell>
      <TableCell>{tenant.phone || '-'}</TableCell>
      <TableCell>
        {onViewUsers ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewUsers(tenant);
            }}
            className="h-6 px-2"
          >
            <Users className="mr-1 h-4 w-4" />
            {translations.viewUsers}
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
          {tenant.isActive ? translations.active : translations.inactive}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onManageFeatures && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onManageFeatures(tenant);
              }}
              className="h-8 w-8"
              title={translations.manageFeatures}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tenant);
            }}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
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

  return { renderRow, renderCard };
};
