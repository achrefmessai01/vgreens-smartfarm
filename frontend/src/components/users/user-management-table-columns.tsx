import { type Column } from '@/components/ui/data-table/data-table';
import { type User } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import type { UserSortDirection } from '@/lib/hooks/use-user-table-filters';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface UseUserManagementColumnsArgs {
  sortDirection: UserSortDirection;
  toggleSort: () => void;
  hideTenantColumn?: boolean;
}

/**
 * Column definitions for the users list-view `DataTable`. Kept in its own
 * module so the orchestrator stays purely compositional. The `user` header
 * pairs a plain-text label with a small sort-toggle button — splitting the
 * two nodes guarantees the label is always visible even when the button
 * ends up empty for any reason. Matches `useTenantColumns` visually.
 */
export function useUserManagementColumns({
  sortDirection,
  toggleSort,
  hideTenantColumn = false,
}: UseUserManagementColumnsArgs): Column<User>[] {
  const { t } = useI18n();
  const headerCn = 'text-muted-foreground text-xs uppercase tracking-wide';
  const labels = t.pages.admin.users;

  return [
    {
      key: 'user',
      headerClassName: headerCn,
      header: (
        <span className="inline-flex items-center gap-1.5">
          <span>{labels.user || 'User'}</span>
          <button
            type="button"
            onClick={toggleSort}
            aria-label={labels.user || 'User'}
            className="text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            {sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </button>
        </span>
      ),
    },
    {
      key: 'role',
      header: <span>{labels.role || 'Role'}</span>,
      headerClassName: headerCn,
    },
    ...(hideTenantColumn
      ? []
      : [
          {
            key: 'tenant',
            header: <span>{labels.tenant || 'Tenant'}</span>,
            headerClassName: headerCn,
          },
        ]),
    {
      key: 'status',
      header: <span>{labels.status || 'Status'}</span>,
      headerClassName: headerCn,
    },
    {
      key: 'actions',
      header: <span>{labels.actions || 'Actions'}</span>,
      headerClassName: cn(headerCn, 'text-right'),
    },
  ];
}
