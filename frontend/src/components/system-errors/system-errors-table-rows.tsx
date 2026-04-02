import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorSourceBadge } from '@/components/ui/error-source-badge';
import { ErrorTypeBadge } from '@/components/ui/error-type-badge';
import { TableCell } from '@/components/ui/table';
import { SystemError } from '@/generated/graphql';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Eye } from 'lucide-react';
import { useSystemErrorsCard } from './system-errors-table-cards';

/**
 * Row rendering components for system errors table
 */

interface SystemErrorsRowProps {
  onResolve: (error: SystemError) => void;
  onViewDetails: (error: SystemError) => void;
  isLoading?: boolean;
  isResolving?: boolean;
}

export const useSystemErrorsRow = ({
  onResolve,
  onViewDetails,
  isLoading = false,
  isResolving = false,
}: SystemErrorsRowProps) => {
  // Get card renderer from dedicated card module
  const { renderCard } = useSystemErrorsCard({
    onResolve,
    onViewDetails,
    isLoading,
    isResolving,
  });

  const renderRow = (error: SystemError) => {
    const userName = error.user
      ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() ||
        error.user.email
      : '-';

    return (
      <>
        <TableCell className="max-w-xs truncate font-medium">
          {error.errorMessage}
        </TableCell>
        <TableCell>{error.component || '-'}</TableCell>
        <TableCell>
          <ErrorTypeBadge errorType={error.errorType} />
        </TableCell>
        <TableCell>
          <ErrorSourceBadge source={error.source} />
        </TableCell>
        <TableCell>
          <ErrorReportSeverityBadge severity={error.severity} />
        </TableCell>
        <TableCell>{error.occurrenceCount ?? 1}</TableCell>
        <TableCell>
          {error.isResolved ? (
            <Badge variant="secondary">Resolved</Badge>
          ) : (
            <Badge variant="destructive">Active</Badge>
          )}
        </TableCell>
        <TableCell>
          {formatDistanceToNow(new Date(error.createdAt))} ago
        </TableCell>
        <TableCell>{userName}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(error)}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!error.isResolved && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onResolve(error)}
                className="h-8 w-8"
                disabled={isLoading || isResolving}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </>
    );
  };

  return { renderRow, renderCard };
};
