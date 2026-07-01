'use client';

import { WriteActionButton } from '@/components/ui/write-action-button';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';
import { TableCell } from '@/components/ui/table';
import { ErrorReport, ReportStatus } from '@/generated/graphql';
import { useI18n, useLocaleFormatters } from '@/i18n';
import { Edit2, Trash2 } from 'lucide-react';
import { ErrorReportQuickActions } from './error-report-quick-actions';
import { ErrorReportSeverityBadge } from './error-report-severity-badge';

interface ErrorReportTableProps {
  reports: ErrorReport[];
  isLoading?: boolean;
  onEdit: (report: ErrorReport) => void;
  onDelete: (report: ErrorReport) => void;
  onStatusUpdate: (id: string, status: ReportStatus) => Promise<void>;
  isUpdating?: boolean;
}

export function ErrorReportTable({
  reports,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusUpdate,
  isUpdating = false,
}: ErrorReportTableProps) {
  const { t } = useI18n();
  const { formatDate, formatTime } = useLocaleFormatters();
  const reportsT = t.pages.admin.reports;

  // Table column configuration
  const columns: Column<ErrorReport>[] = [
    {
      key: 'errorTitle',
      header: reportsT.errorTitle,
      accessor: (report) => (
        <div className="max-w-xs">
          <div className="truncate font-medium">{report.errorTitle}</div>
          <div className="truncate text-xs text-gray-500">
            ID: {report.id.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: reportsT.submittedBy,
      accessor: (report) => (
        <div className="text-sm">
          <div className="font-medium">
            {report.user.firstName} {report.user.lastName}
          </div>
          <div className="text-gray-500">{report.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: reportsT.severity,
      accessor: (report) => (
        <ErrorReportSeverityBadge severity={report.severity} />
      ),
    },
    {
      key: 'status',
      header: reportsT.status,
      accessor: (report) => (
        <ErrorReportQuickActions
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      ),
    },
    {
      key: 'createdAt',
      header: reportsT.created,
      accessor: (report) => (
        <div className="text-sm">
          <div>{formatDate(report.createdAt, { dateStyle: 'medium' })}</div>
          <div className="text-xs text-gray-500">
            {formatTime(report.createdAt, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: reportsT.actions,
      accessor: (report) => (
        <div className="flex items-center gap-1">
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(report)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </WriteActionButton>
        </div>
      ),
    },
  ];

  // Table row renderer (for mobile responsive view)
  const renderRow = (report: ErrorReport) => (
    <>
      <TableCell>
        <div className="max-w-xs">
          <div className="truncate font-medium">{report.errorTitle}</div>
          <div className="truncate text-xs text-gray-500">
            ID: {report.id.slice(0, 8)}...
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">
            {report.user.firstName} {report.user.lastName}
          </div>
          <div className="text-gray-500">{report.userEmail}</div>
        </div>
      </TableCell>
      <TableCell>
        <ErrorReportSeverityBadge severity={report.severity} />
      </TableCell>
      <TableCell>
        <ErrorReportQuickActions
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{formatDate(report.createdAt, { dateStyle: 'medium' })}</div>
          <div className="text-xs text-gray-500">
            {formatTime(report.createdAt, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(report)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </WriteActionButton>
        </div>
      </TableCell>
    </>
  );

  const renderCard = (report: ErrorReport) => (
    <div className="border-border/60 bg-card space-y-3 rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{report.errorTitle}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            ID: {report.id.slice(0, 8)}...
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(report)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </WriteActionButton>
          <WriteActionButton
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </WriteActionButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ErrorReportSeverityBadge severity={report.severity} />
        <ErrorReportQuickActions
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="font-medium">
            {report.user.firstName} {report.user.lastName}
          </p>
          <p className="text-muted-foreground max-w-[180px] truncate text-xs">
            {report.userEmail}
          </p>
        </div>
        <div className="text-muted-foreground shrink-0 text-right text-xs">
          <p>{formatDate(report.createdAt, { dateStyle: 'medium' })}</p>
          <p>
            {formatTime(report.createdAt, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <DataTable
      data={reports}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      responsiveBreakpoint="xl"
      isLoading={isLoading}
      searchConfig={{
        placeholder: reportsT.searchPlaceholder,
        onSearch: (query, report) =>
          report.errorTitle.toLowerCase().includes(query.toLowerCase()) ||
          report.userEmail.toLowerCase().includes(query.toLowerCase()) ||
          (report.user.firstName + ' ' + report.user.lastName)
            .toLowerCase()
            .includes(query.toLowerCase()),
      }}
      emptyState={{
        title: reportsT.noReports,
        description: reportsT.noReports,
      }}
    />
  );
}
