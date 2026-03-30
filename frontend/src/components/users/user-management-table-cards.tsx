import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, UserRole, UserStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * Card rendering components for user management table
 */

interface UserManagementCardProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
  hideTenantColumn?: boolean;
  roleLabels: Record<UserRole, string>;
}

export const useUserManagementCard = ({
  onEdit,
  onDelete,
  isLoading = false,
  hideTenantColumn = false,
  roleLabels,
}: UserManagementCardProps) => {
  const { t } = useI18n();

  const renderCard = (user: User) => {
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      t.pages.admin.users.notAvailable;

    return (
      <Card className="gap-2 overflow-hidden border py-2 shadow-none">
        {/* Custom-Header implementation - using card-header breaks ux */}
        <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
          <h3 className="text-sm leading-none font-semibold">{fullName}</h3>
          <Badge variant="outline" className="text-xs">
            {roleLabels[user.role] || user.role}
          </Badge>
        </div>

        <CardContent className="space-y-2 text-xs">
          {/* Email */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.admin.users.email}:
            </span>
            <span className="font-medium break-all">{user.email || '-'}</span>
          </div>

          {/* Tenant */}
          {!hideTenantColumn && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {t.pages.admin.users.tenant}:
              </span>
              <span className="font-medium">{user.tenant?.name || '-'}</span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.admin.users.status}:
            </span>
            <Badge
              variant={
                user.status === UserStatus.Active
                  ? 'default'
                  : user.status === UserStatus.Pending
                    ? 'outline'
                    : 'secondary'
              }
              className="h-5 text-xs"
            >
              {user.status === UserStatus.Pending
                ? t.pages.admin.users.pending
                : user.isActive
                  ? t.pages.admin.users.active
                  : t.pages.admin.users.inactive}
            </Badge>
          </div>
        </CardContent>

        {/* Custom-Footer implementation - using card-footer breaks ux */}
        <div className="flex items-center border-t px-6 pt-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
              className="text-destructive hover:text-destructive h-8 w-8"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return { renderCard };
};
