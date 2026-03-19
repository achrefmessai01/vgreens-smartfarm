'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell } from '@/components/ui/table'
import { ErrorSourceBadge } from '@/components/ui/error-source-badge'
import { ErrorTypeBadge } from '@/components/ui/error-type-badge'
import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge'
import { SystemError } from '@/generated/graphql'
import { formatDistanceToNow } from 'date-fns'
import { Eye, CheckCircle2 } from 'lucide-react'
import { DataTable, type Column, type FilterConfigOption } from '@/components/ui/data-table'

interface SystemErrorsTableProps {
  errors: SystemError[]
  isLoading?: boolean
  onResolve: (error: SystemError) => void
  onViewDetails: (error: SystemError) => void
  isResolving?: boolean
  filterConfigs?: FilterConfigOption[]
}

export function SystemErrorsTable({
  errors,
  isLoading = false,
  onResolve,
  onViewDetails,
  isResolving = false,
  filterConfigs,
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
  ]

  const renderRow = (error: SystemError) => (
    <>
      <TableCell className="font-medium max-w-xs truncate">{error.errorMessage}</TableCell>
      <TableCell>{error.component || '-'}</TableCell>
      <TableCell><ErrorTypeBadge errorType={error.errorType} /></TableCell>
      <TableCell><ErrorSourceBadge source={error.source} /></TableCell>
      <TableCell><ErrorReportSeverityBadge severity={error.severity} /></TableCell>
      <TableCell>{error.occurrenceCount ?? 1}</TableCell>
      <TableCell>{error.isResolved ? <Badge variant="secondary">Resolved</Badge> : <Badge variant="destructive">Active</Badge>}</TableCell>
      <TableCell>{formatDistanceToNow(new Date(error.createdAt))} ago</TableCell>
      <TableCell>{error.user ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() || error.user.email : '-'}</TableCell>
      <TableCell className="text-right">
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
      </TableCell>
    </>
  )

  const renderCard = (error: SystemError) => (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-snug line-clamp-2 min-w-0">{error.errorMessage}</p>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onViewDetails(error)} className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          {!error.isResolved && (
            <Button size="sm" onClick={() => onResolve(error)} disabled={isResolving} className="h-8 w-8 p-0">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ErrorTypeBadge errorType={error.errorType} />
        <ErrorSourceBadge source={error.source} />
        <ErrorReportSeverityBadge severity={error.severity} />
        {error.isResolved
          ? <Badge variant="secondary">Resolved</Badge>
          : <Badge variant="destructive">Active</Badge>
        }
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="space-y-0.5">
          <p>{error.component || 'No component'}</p>
          <p>{error.user ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() || error.user.email : '-'}</p>
        </div>
        <div className="text-right space-y-0.5">
          <p>{formatDistanceToNow(new Date(error.createdAt))} ago</p>
          <p>×{error.occurrenceCount ?? 1}</p>
        </div>
      </div>
    </div>
  )

  return (
    <DataTable
      data={errors}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      responsiveBreakpoint="lg"
      isLoading={isLoading}
      defaultPageSize={10}
      pageSizeOptions={[10, 15, 25, 50]}
      paginationVariant="compact"
      emptyState={{ title: 'No system errors found' }}
      filterConfigs={filterConfigs}
    />
  )
}
