import * as React from 'react'
import { type FilterConfigOption } from '@/components/ui/data-table'
import { ErrorSource, ErrorType, ReportSeverity } from '@/generated/graphql'
import { useI18n } from '@/i18n'

export interface SystemErrorsFilterInput {
  severityIn?: ReportSeverity[]
  sourceIn?: ErrorSource[]
  typeIn?: ErrorType[]
  isResolved?: boolean
}

export const useSystemErrorTableFilters = (
  filter: SystemErrorsFilterInput,
  onFilterChange: (updates: Partial<SystemErrorsFilterInput>) => void
): FilterConfigOption[] => {
  const { t } = useI18n()

  return React.useMemo(
    () => [
      {
        label: t.pages.admin.reports.severity ?? 'Severity',
        value: filter.severityIn?.length ? filter.severityIn.join(',') : '',
        options: [
          { label: t.pages.admin.reports.severities.low ?? 'Low', value: ReportSeverity.Low },
          { label: t.pages.admin.reports.severities.medium ?? 'Medium', value: ReportSeverity.Medium },
          { label: t.pages.admin.reports.severities.high ?? 'High', value: ReportSeverity.High },
          { label: t.pages.admin.reports.severities.critical ?? 'Critical', value: ReportSeverity.Critical },
          { label: t.pages.admin.reports.severities.urgent ?? 'Urgent', value: ReportSeverity.Urgent },
        ],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            severityIn: value
              ? (value.split(',').map((item) => item.trim()).filter(Boolean) as ReportSeverity[])
              : undefined,
          }),
      },
      {
        label: t.pages.admin.reports.source ?? 'Source',
        value: filter.sourceIn?.length ? filter.sourceIn.join(',') : '',
        options: [
          { label: 'Frontend', value: ErrorSource.Frontend },
          { label: 'Backend', value: ErrorSource.Backend },
          { label: 'Database', value: ErrorSource.Database },
          { label: 'External API', value: ErrorSource.ExternalApi },
          { label: 'Infrastructure', value: ErrorSource.Infrastructure },
        ],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            sourceIn: value
              ? (value.split(',').map((item) => item.trim()).filter(Boolean) as ErrorSource[])
              : undefined,
          }),
      },
      {
        label: t.pages.admin.reports.type ?? 'Type',
        value: filter.typeIn?.length ? filter.typeIn.join(',') : '',
        options: Object.values(ErrorType).map((type) => ({ label: type, value: type })),
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            typeIn: value
              ? (value.split(',').map((item) => item.trim()).filter(Boolean) as ErrorType[])
              : undefined,
          }),
      },
      {
        label: t.pages.admin.reports.status ?? 'Status',
        value: filter.isResolved === undefined ? '' : filter.isResolved ? 'resolved' : 'active',
        options: [
          { label: t.pages.admin.reports.statuses.open ?? 'Active', value: 'active' },
          { label: t.pages.admin.reports.statuses.resolved ?? 'Resolved', value: 'resolved' },
        ],
        multiSelect: false,
        onFilterChange: (value) =>
          onFilterChange({
            isResolved: value === '' ? undefined : value === 'resolved',
          }),
      },
    ],
    [filter, onFilterChange, t]
  )
}
