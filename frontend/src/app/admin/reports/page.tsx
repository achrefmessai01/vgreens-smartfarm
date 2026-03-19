'use client';

import * as React from 'react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import {
  ErrorReport,
  ReportStatus,
  UpdateErrorReportInput,
} from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  useErrorReports,
  useUpdateErrorReportStatus,
  useUpdateErrorReport,
  useDeleteErrorReport,
} from '@/lib/hooks/use-error-reports';
import {
  ErrorReportTable,
  ErrorReportDetails,
  ErrorReportDeleteDialog,
} from '@/components/error-reports';

export default function AdminReportsPage() {
  const { t } = useI18n();
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ErrorReport | null>(null);

  // Data fetching and mutations
  const { data, loading, refetch } = useErrorReports();
  const [updateStatus, { loading: isStatusUpdating }] =
    useUpdateErrorReportStatus();
  const [updateReport, { loading: isReportUpdating }] = useUpdateErrorReport();
  const [deleteReport] = useDeleteErrorReport();

  const reports = data?.errorReports || [];

  // Action handlers
  const handleStatusChange = async (id: string, status: ReportStatus) => {
    try {
      await updateStatus({ variables: { id, status } });
      await refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEdit = (report: ErrorReport) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleUpdate = async (id: string, data: UpdateErrorReportInput) => {
    try {
      await updateReport({ variables: { id, input: data } });
      await refetch();
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteReport({ variables: { id: deleteConfirm.id } });
      setDeleteConfirm(null);
      await refetch();
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t.pages.admin.reports.title}
        subtitle={t.pages.admin.reports.subtitle}
      />

      <ErrorReportTable
        reports={reports}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
        onStatusUpdate={handleStatusChange}
        isUpdating={isStatusUpdating}
      />

      <ErrorReportDetails
        report={selectedReport}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedReport(null);
        }}
        onUpdate={handleUpdate}
        isUpdating={isReportUpdating}
      />

      <ErrorReportDeleteDialog
        isOpen={!!deleteConfirm}
        reportTitle={deleteConfirm?.errorTitle || ''}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
