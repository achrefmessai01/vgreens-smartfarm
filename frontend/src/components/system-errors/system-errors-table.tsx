'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorSourceBadge } from '@/components/ui/error-source-badge'
import { ErrorTypeBadge } from '@/components/ui/error-type-badge'
import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge'
import { ErrorSource, ErrorType, ReportSeverity, SystemError } from '@/generated/graphql'
import { formatDistanceToNow } from 'date-fns'
import { Eye, CheckCircle2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'


interface SystemErrorsTableProps {
  errors: SystemError[]
  isLoading?: boolean
  onResolve: (error: SystemError) => void
  onViewDetails: (error: SystemError) => void
  isResolving?: boolean
  filterConfigs?: any // Pass filterConfigs to DataTable
}

export function SystemErrorsTable({ 
  errors, 
  isLoading = false,
  onResolve,
  onViewDetails, 
  isResolving = false,
  filterConfigs
}: SystemErrorsTableProps) {
  const columns: Column<SystemError>[] = [
    { key: 'errorMessage', header: 'Message' },
    { key: 'component', header: 'Component' },
    { key: 'errorType', header: 'Type', accessor: (e) => <ErrorTypeBadge errorType={e.errorType} /> },
    { key: 'source', header: 'Source', accessor: (e) => <ErrorSourceBadge source={e.source} /> },
    { key: 'severity', header: 'Severity', accessor: (e) => <ErrorReportSeverityBadge severity={e.severity} /> },
    { key: 'occurrenceCount', header: 'Count' },
    { key: 'isResolved', header: 'Status', accessor: (e) => e.isResolved ? <Badge variant="secondary">Resolved</Badge> : <Badge variant="destructive">Active</Badge> },
    { key: 'createdAt', header: 'Created', accessor: (e) => formatDistanceToNow(new Date(e.createdAt)) + ' ago' },
    { key: 'user', header: 'User', accessor: (e) => e.user ? `${e.user.firstName ?? ''} ${e.user.lastName ?? ''}`.trim() || e.user.email : '-' },
    { key: 'actions', header: 'Actions', headerClassName: 'text-right' },
  ];

  const renderRow = (error: SystemError) => (
    <>
      <td className="font-medium max-w-xs truncate">{error.errorMessage}</td>
      <td>{error.component || '-'}</td>
      <td><ErrorTypeBadge errorType={error.errorType} /></td>
      <td><ErrorSourceBadge source={error.source} /></td>
      <td><ErrorReportSeverityBadge severity={error.severity} /></td>
      <td>{error.occurrenceCount ?? 1}</td>
      <td>{error.isResolved ? <Badge variant="secondary">Resolved</Badge> : <Badge variant="destructive">Active</Badge>}</td>
      <td>{formatDistanceToNow(new Date(error.createdAt))} ago</td>
      <td>{error.user ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() || error.user.email : '-'}</td>
      <td className="text-right">
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => onViewDetails(error)}>
            <Eye className="h-4 w-4" />
          </Button>
          {!error.isResolved && (
            <Button size="sm" onClick={() => onResolve(error)} disabled={isResolving}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </>
  );

  return (
    <DataTable
      data={errors}
      columns={columns}
      renderRow={renderRow}
      isLoading={isLoading}
      defaultPageSize={10}
      pageSizeOptions={[10, 15, 25, 50]}
      paginationVariant="compact"
      emptyState={{ title: 'No system errors found' }}
      filterConfigs={filterConfigs}
    />
  );
}