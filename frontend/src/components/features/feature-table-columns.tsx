import { type Column } from '@/components/ui/data-table/data-table';
import type { Feature } from '@/generated/graphql';
import type { FeatureSortDirection } from '@/lib/hooks/use-feature-table-filters';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface UseFeatureTableColumnsArgs {
  sortDirection: FeatureSortDirection;
  toggleSort: () => void;
  labels: {
    flag: string;
    category: string;
    description: string;
    status: string;
    actions: string;
  };
}

/**
 * Column definitions for the feature-flag admin `DataTable`. Kept in its
 * own module so the orchestrator stays purely compositional. The FLAG
 * header pairs a plain-text label with a small sort-toggle button —
 * splitting the two nodes guarantees the label stays visible even when
 * the icon end of the button renders empty for any reason. Matches
 * `useUserManagementColumns` visually.
 */
export function useFeatureTableColumns({
  sortDirection,
  toggleSort,
  labels,
}: UseFeatureTableColumnsArgs): Column<Feature>[] {
  const headerCn = 'text-muted-foreground text-xs uppercase tracking-wide';

  return [
    {
      key: 'flag',
      headerClassName: headerCn,
      header: (
        <span className="inline-flex items-center gap-1.5">
          <span>{labels.flag || 'Flag'}</span>
          <button
            type="button"
            onClick={toggleSort}
            aria-label={labels.flag || 'Flag'}
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
      key: 'category',
      header: <span>{labels.category || 'Category'}</span>,
      headerClassName: headerCn,
    },
    {
      key: 'description',
      header: <span>{labels.description || 'Description'}</span>,
      headerClassName: headerCn,
    },
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
