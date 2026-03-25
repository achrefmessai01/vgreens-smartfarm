import { TableCell } from '@/components/ui/table';
import { Alert, AlertStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  renderPrimaryActions,
  renderSecondaryActions,
  type ActionHandlers,
} from './alert-table-actions';
import { useAlertTableCard } from './alert-table-cards';
import {
  formatFieldLabel,
  formatTimestamp,
  formatUser,
  getRowClassName,
  getSeverityBadge,
  getStatusBadge,
} from './alert-table-utils';

/**
 * Row rendering components for alert table
 */

export const useAlertTableRow = (actionHandlers: ActionHandlers) => {
  const { t } = useI18n();
  const hideEditButton = true;
  const hasSecondaryActions = Boolean(
    (actionHandlers.onEdit && !hideEditButton) || actionHandlers.onDelete,
  );

  // Get card renderer from dedicated card module
  const { renderCard } = useAlertTableCard(actionHandlers, hasSecondaryActions);

  const renderRow = (alert: Alert) => {
    const rowClassName = getRowClassName(alert);
    const isResolved = alert.status === AlertStatus.Resolved;
    const textClassName = isResolved ? 'text-muted-foreground' : '';
    const cellClassName = `${rowClassName} ${textClassName}`.trim();

    return (
      <>
        <TableCell className={`font-medium ${cellClassName}`.trim()}>
          {alert.sensorName}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatFieldLabel(alert.field)}
        </TableCell>
        <TableCell className={cellClassName}>{alert.value}</TableCell>
        <TableCell className={cellClassName}>
          {getStatusBadge(alert.status, t)}
        </TableCell>
        <TableCell className={cellClassName}>
          {getSeverityBadge(alert.severity, t)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatTimestamp(alert.timestamp)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatUser(alert.acknowledgedBy)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatUser(alert.resolvedBy)}
        </TableCell>
        <TableCell className={`text-right ${cellClassName}`.trim()}>
          <div className="flex items-center justify-end gap-2">
            {renderPrimaryActions(alert, actionHandlers, t)}
            {hasSecondaryActions
              ? renderSecondaryActions(alert, actionHandlers)
              : null}
          </div>
        </TableCell>
      </>
    );
  };

  return { renderRow, renderCard };
};
