import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { Alert, AlertStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { BadgeCheck, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

/**
 * Alert table action logic and button rendering
 */

export interface ActionHandlers {
  onAcknowledge: (alert: Alert) => void;
  onResolve: (alert: Alert) => void;
  onEdit?: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
  isLoading?: boolean;
}

export const getActionState = (alert: Alert) => ({
  canAcknowledge:
    alert.status === AlertStatus.Open && alert.acknowledgedBy == null,
  canResolve:
    (alert.status === AlertStatus.Open ||
      alert.status === AlertStatus.Acknowledged) &&
    alert.resolvedBy == null &&
    alert.acknowledgedBy != null,
});

export const renderPrimaryActions = (
  alert: Alert,
  { onAcknowledge, onResolve, isLoading }: ActionHandlers,
  t: ReturnType<typeof useI18n>['t'],
  stacked = false,
) => {
  const { canAcknowledge, canResolve } = getActionState(alert);

  if (!canAcknowledge && !canResolve) return null;

  return (
    <div className={cn('flex gap-2', stacked && 'flex-col sm:flex-row')}>
      {canAcknowledge && (
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onAcknowledge(alert);
          }}
          disabled={isLoading}
          className={cn(
            'h-8 gap-1.5 border-amber-500/60 text-amber-600 hover:bg-amber-500/10 dark:text-amber-300',
            stacked && 'w-full sm:w-auto',
          )}
        >
          <BadgeCheck className="h-4 w-4" />
          {t.pages.alerts.acknowledge}
        </Button>
      )}
      {canResolve && (
        <Button
          variant="default"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onResolve(alert);
          }}
          disabled={isLoading}
          className={cn('h-8 gap-1.5 px-3', stacked && 'w-full sm:w-auto')}
        >
          <CheckCircle2 className="h-4 w-4" />
          {t.pages.alerts.resolve}
        </Button>
      )}
    </div>
  );
};

export const renderSecondaryActions = (
  alert: Alert,
  { onEdit, onDelete, isLoading }: ActionHandlers,
) => (
  <>
    {onEdit && (
      <WriteActionButton
        variant="ghost"
        size="icon"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(alert);
        }}
        disabled={isLoading}
        className="h-8 w-8 rounded-full border border-sky-200/80 text-sky-700 hover:bg-sky-100 hover:text-sky-800 dark:border-sky-900/70 dark:text-sky-300 dark:hover:bg-sky-950/40"
      >
        <Pencil className="h-4 w-4" />
      </WriteActionButton>
    )}
    {onDelete && (
      <WriteActionButton
        variant="ghost"
        size="icon"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(alert);
        }}
        disabled={isLoading}
        className="h-8 w-8 rounded-full border border-rose-200/80 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40"
      >
        <Trash2 className="h-4 w-4" />
      </WriteActionButton>
    )}
  </>
);
