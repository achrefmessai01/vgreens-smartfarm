'use client';

import { FeatureGuard } from '@/components/features/feature-guard';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmationDialog } from '@/components/users';
import { WarningTable } from '@/components/warnings';
import { WarningSidebar } from '@/components/warnings/warning-sidebar';
import { useI18n } from '@/i18n';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { getAllWarnings, updateWarningStatus } from '@/lib/warning-data';
import type { Warning, WarningStatus } from '@/types/warning.types';
import * as React from 'react';

export default function WarningsPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const [warnings, setWarnings] = React.useState<Warning[]>([]);
  const [selectedWarning, setSelectedWarning] = React.useState<Warning | null>(
    null,
  );
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean;
    warning: Warning | null;
    action: 'acknowledge' | 'resolve' | null;
  }>({ isOpen: false, warning: null, action: null });

  React.useEffect(() => {
    setWarnings(getAllWarnings());
  }, []);

  const handleAcknowledge = (warning: Warning) => {
    setActionDialog({ isOpen: true, warning, action: 'acknowledge' });
  };

  const handleResolve = (warning: Warning) => {
    setActionDialog({ isOpen: true, warning, action: 'resolve' });
  };

  const handleSidebarAcknowledge = (warning: Warning) => {
    setSelectedWarning(null);
    handleAcknowledge(warning);
  };

  const handleSidebarResolve = (warning: Warning) => {
    setSelectedWarning(null);
    handleResolve(warning);
  };

  const handleWarningRowClick = (warning: Warning) => {
    setSelectedWarning(warning);
  };

  const handleSidebarOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedWarning(null);
    }
  };

  const confirmAction = () => {
    if (actionDialog.warning && actionDialog.action) {
      const newStatus: WarningStatus =
        actionDialog.action === 'acknowledge' ? 'acknowledged' : 'resolved';
      const updated = updateWarningStatus(actionDialog.warning.id, newStatus);

      if (updated) {
        setWarnings(getAllWarnings());
        setSelectedWarning((prev) =>
          prev?.id === updated.id ? updated : prev,
        );
        setActionDialog({ isOpen: false, warning: null, action: null });
      }
    }
  };

  const getDialogTitle = () => {
    if (actionDialog.action === 'acknowledge') {
      return t.pages.warnings.acknowledgeWarning;
    }
    return t.pages.warnings.resolveWarning;
  };

  const getDialogDescription = () => {
    if (actionDialog.action === 'acknowledge') {
      return t.pages.warnings.acknowledgeDescription;
    }
    return t.pages.warnings.resolveDescription;
  };

  return (
    <FeatureGuard featureKey="sensor_alerts">
      <div
        className={
          isMobile
            ? 'flex flex-col gap-6'
            : 'flex h-full min-h-0 flex-col gap-6'
        }
      >
        <PageHeader
          title={t.pages.warnings.title}
          subtitle={t.pages.warnings.subtitle}
        />

        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <WarningTable
            warnings={warnings}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onRowClick={handleWarningRowClick}
          />
        </div>

        <WarningSidebar
          open={selectedWarning !== null}
          onOpenChange={handleSidebarOpenChange}
          warning={selectedWarning}
          onAcknowledge={handleSidebarAcknowledge}
          onResolve={handleSidebarResolve}
        />

        <ConfirmationDialog
          open={actionDialog.isOpen}
          onOpenChange={(open) =>
            setActionDialog({ isOpen: open, warning: null, action: null })
          }
          title={getDialogTitle()}
          description={getDialogDescription()}
          confirmLabel={
            actionDialog.action === 'acknowledge'
              ? t.pages.warnings.acknowledge
              : t.pages.warnings.resolve
          }
          cancelLabel={t.pages.users.cancel}
          variant="default"
          onConfirm={confirmAction}
          onCancel={() =>
            setActionDialog({ isOpen: false, warning: null, action: null })
          }
          readOnlyExempt
        >
          {actionDialog.warning && (
            <div className="space-y-4">
              <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
                <p className="dark:text-card-foreground font-medium">
                  {actionDialog.warning.sensorName}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground/80 mt-1 text-sm">
                  {t.pages.warnings.value}: {actionDialog.warning.value}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground/80 mt-1 text-sm">
                  {t.pages.warnings.tunnel}: {actionDialog.warning.tunnel}
                </p>
              </div>
            </div>
          )}
        </ConfirmationDialog>
      </div>
    </FeatureGuard>
  );
}
