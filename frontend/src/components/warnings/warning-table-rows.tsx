import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { useI18n, useLocaleFormatters } from '@/i18n';
import type { Warning } from '@/types/warning.types';
import { useWarningCard } from './warning-table-cards';
import { formatTimestamp, getStatusBadge } from './warning-table-utils';

/**
 * Row rendering components for warning table
 */

interface WarningRowProps {
  onAcknowledge: (warning: Warning) => void;
  onResolve: (warning: Warning) => void;
  translations: {
    open: string;
    acknowledged: string;
    resolved: string;
    value: string;
    timestamp: string;
    tunnel: string;
    acknowledge: string;
    resolve: string;
  };
}

export const useWarningRow = ({
  onAcknowledge,
  onResolve,
  translations,
}: WarningRowProps) => {
  const formatters = useLocaleFormatters();
  const { t } = useI18n();
  // Get card renderer from dedicated card module
  const { renderCard } = useWarningCard({
    onAcknowledge,
    onResolve,
    translations,
  });

  const renderRow = (warning: Warning) => (
    <>
      <TableCell className="font-medium dark:text-white">
        {warning.sensorName}
      </TableCell>
      <TableCell className="dark:text-gray-300">{warning.value}</TableCell>
      <TableCell className="dark:text-gray-300">
        {formatTimestamp(warning.timestamp, formatters, t)}
      </TableCell>
      <TableCell className="hidden md:table-cell dark:text-gray-300">
        {warning.tunnel}
      </TableCell>
      <TableCell>
        {getStatusBadge({ status: warning.status, translations })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {warning.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(warning);
              }}
              className="dark:border-border/50 dark:hover:bg-muted/70 h-8 dark:text-white"
            >
              {translations.acknowledge}
            </Button>
          )}
          {warning.status !== 'resolved' && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onResolve(warning);
              }}
              className="h-8"
            >
              {translations.resolve}
            </Button>
          )}
        </div>
      </TableCell>
    </>
  );

  return { renderRow, renderCard };
};
