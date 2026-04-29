'use client';

import {
  AlertActionDialog,
  AlertDeleteDialog,
  AlertFormSheet,
  AlertPageHeader,
  AlertSidebar,
  AlertTable,
} from '@/components/alerts';
import { FeatureGuard } from '@/components/features/feature-guard';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useUsersQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useAlertsPage } from '@/lib/hooks/use-alerts-page';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';

export default function AlertsPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const { data: usersData } = useUsersQuery();
  const users = usersData?.users ?? [];
  const page = useAlertsPage();

  // Only show the full-page skeleton on the very first load. Subsequent
  // refetches (search, filter changes, polling) keep the previous data on
  // screen and rely on the in-table skeleton via `tableLoading` below.
  if (page.firstLoad) {
    return (
      <div className="space-y-6">
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={7} rowCount={8} />
      </div>
    );
  }

  return (
    <FeatureGuard featureKey="sensor_alerts">
      <div
        className={
          isMobile
            ? 'flex flex-col gap-6'
            : 'flex h-full min-h-0 flex-col gap-6'
        }
      >
        <AlertPageHeader
          openAlertsCount={page.openAlertsCount}
          onCreate={page.onCreate}
          isLoading={page.isLoading}
        />

        <div className={isMobile ? '' : 'min-h-0 flex-1'}>
          <AlertTable
            alerts={page.alerts}
            filter={page.filter}
            onFilterChange={page.onFilterChange}
            users={users}
            onAcknowledge={page.onAcknowledge}
            onResolve={page.onResolve}
            onEdit={page.onEdit}
            onDelete={page.onDelete}
            onRowClick={page.handleAlertRowClick}
            isLoading={page.isLoading}
            tableLoading={page.loading}
          />
        </div>

        <AlertSidebar
          open={page.selectedAlert !== null}
          onOpenChange={page.handleSidebarOpenChange}
          alert={page.selectedAlert}
          onAcknowledge={page.handleSidebarAcknowledge}
          onResolve={page.handleSidebarResolve}
          isLoading={page.isLoading}
        />

        <AlertFormSheet
          open={page.isSheetOpen}
          onOpenChange={page.setIsSheetOpen}
          alert={page.editingAlert}
          onSubmit={page.handleSubmit}
          onCancel={page.handleCancel}
          isLoading={page.isLoading}
        />

        <AlertActionDialog
          open={page.actionDialog.isOpen}
          onOpenChange={(open) =>
            page.setActionDialog({ isOpen: open, alert: null, action: null })
          }
          alert={page.actionDialog.alert}
          action={page.actionDialog.action}
          onConfirm={page.confirmAction}
          onCancel={() =>
            page.setActionDialog({ isOpen: false, alert: null, action: null })
          }
          isLoading={page.isLoading}
        />

        <AlertDeleteDialog
          open={page.deleteConfirmation.isOpen}
          onOpenChange={(open) =>
            page.setDeleteConfirmation({ alert: null, isOpen: open })
          }
          alert={page.deleteConfirmation.alert}
          onConfirm={page.confirmDelete}
          onCancel={() =>
            page.setDeleteConfirmation({ alert: null, isOpen: false })
          }
          isLoading={page.isLoading}
        />
      </div>
    </FeatureGuard>
  );
}
