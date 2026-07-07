import { type Column } from '@/components/ui/data-table/data-table';
import type { TenantData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import type { TenantSortDirection } from '@/lib/hooks/use-tenant-table-filters';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface UseTenantColumnsArgs {
  sortDirection: TenantSortDirection;
  toggleSort: () => void;
}

/**
 * Column definitions for the tenants list-view `DataTable`. Kept in its own
 * module so the orchestrator stays purely compositional and under the
 * 150-line component budget. The `name` column is a sortable button; the
 * rest are plain uppercase headers matching the redesigned surface.
 */
export function useTenantColumns({
  sortDirection,
  toggleSort,
}: UseTenantColumnsArgs): Column<TenantData>[] {
  const { t } = useI18n();
  const headerCn = 'text-muted-foreground text-xs uppercase tracking-wide';

  return [
    {
      key: 'name',
      headerClassName: headerCn,
      header: (
        <button
          type="button"
          onClick={toggleSort}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          aria-label={t.pages.admin.tenants.tenant}
        >
          <span>{t.pages.admin.tenants.tenant}</span>
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
        </button>
      ),
    },
    {
      key: 'contact',
      header: <span>{t.pages.admin.tenants.contact}</span>,
      headerClassName: headerCn,
    },
    {
      key: 'status',
      header: <span>{t.pages.admin.tenants.status}</span>,
      headerClassName: headerCn,
    },
    {
      key: 'actions',
      header: <span>{t.pages.admin.tenants.actions}</span>,
      headerClassName: cn(headerCn, 'text-right'),
    },
  ];
}
