'use client'

import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { TableCell } from '@/components/ui/table'
import { ErrorReport } from '@/generated/graphql'
import { ErrorReportSeverityBadge } from './error-report-severity-badge'
import { ErrorReportQuickActions } from './error-report-quick-actions'
import { formatDate } from '@/lib/utils/error-report-utils'
import { Edit2, Trash2 } from 'lucide-react'

interface ErrorReportTableProps {
  reports: ErrorReport[]
  isLoading?: boolean
  onEdit: (report: ErrorReport) => void
  onDelete: (report: ErrorReport) => void
  onStatusUpdate: (id: string, status: any) => Promise<void>
  isUpdating?: boolean
}

export function ErrorReportTable({ 
  reports, 
  isLoading = false,
  onEdit, 
  onDelete, 
  onStatusUpdate,
  isUpdating = false
}: ErrorReportTableProps) {
  // Table column configuration
  const columns: Column<ErrorReport>[] = [
    {
      key: 'errorTitle',
      header: 'Error Title',
      accessor: (report) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{report.errorTitle}</div>
          <div className="text-xs text-gray-500 truncate">
            ID: {report.id.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      key: 'userEmail',
      header: 'Submitted By',
      accessor: (report) => (
        <div className="text-sm">
          <div className="font-medium">{report.user.firstName} {report.user.lastName}</div>
          <div className="text-gray-500">{report.userEmail}</div>
        </div>
      )
    },
    {
      key: 'severity',
      header: 'Severity',
      accessor: (report) => <ErrorReportSeverityBadge severity={report.severity} />
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (report) => (
        <ErrorReportQuickActions 
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (report) => (
        <div className="text-sm">
          <div>{formatDate(report.createdAt)}</div>
          <div className="text-xs text-gray-500">
            {new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(new Date(report.createdAt))}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (report) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(report)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }
  ]

  // Table row renderer (for mobile responsive view)
  const renderRow = (report: ErrorReport) => (
    <>
      <TableCell>
        <div className="max-w-xs">
          <div className="font-medium truncate">{report.errorTitle}</div>
          <div className="text-xs text-gray-500 truncate">
            ID: {report.id.slice(0, 8)}...
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">{report.user.firstName} {report.user.lastName}</div>
          <div className="text-gray-500">{report.userEmail}</div>
        </div>
      </TableCell>
      <TableCell><ErrorReportSeverityBadge severity={report.severity} /></TableCell>
      <TableCell>
        <ErrorReportQuickActions 
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{formatDate(report.createdAt)}</div>
          <div className="text-xs text-gray-500">
            {new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(new Date(report.createdAt))}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(report)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </>
  )

  const renderCard = (report: ErrorReport) => (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{report.errorTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">ID: {report.id.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(report)} className="h-8 w-8 p-0">
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(report)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <ErrorReportSeverityBadge severity={report.severity} />
        <ErrorReportQuickActions
          report={report}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="font-medium">{report.user.firstName} {report.user.lastName}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{report.userEmail}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          <p>{formatDate(report.createdAt)}</p>
          <p>{new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(report.createdAt))}</p>
        </div>
      </div>
    </div>
  )

  return (
    <DataTable
      data={reports}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      isLoading={isLoading}
      searchConfig={{
        placeholder: 'Search reports by title, user email...',
        onSearch: (query, report) =>
          report.errorTitle.toLowerCase().includes(query.toLowerCase()) ||
          report.userEmail.toLowerCase().includes(query.toLowerCase()) ||
          (report.user.firstName + ' ' + report.user.lastName).toLowerCase().includes(query.toLowerCase()),
      }}
      emptyState={{
        title: 'No error reports found',
        description: 'No error reports found',
      }}
    />
  )
}