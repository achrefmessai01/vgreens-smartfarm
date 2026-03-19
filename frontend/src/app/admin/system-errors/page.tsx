'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { SystemError, ReportSeverity, ErrorSource, ErrorType } from '@/generated/graphql'
import { useI18n } from '@/i18n'
import { SystemErrorsStatsCards, SystemErrorsFilters } from '@/components/system-errors'
import {
    useSystemErrors,
    useResolveSystemError,
    useSystemErrorStats
} from '@/lib/hooks/use-system-errors'
import {
    SystemErrorsTable,
    SystemErrorDetailsDialog
} from '@/components/system-errors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ...existing code...

export default function AdminSystemErrorsPage() {
  const { t } = useI18n()
  const [selectedError, setSelectedError] = useState<SystemError | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Filters
  const [severityFilter, setSeverityFilter] = useState<ReportSeverity | undefined>()
  const [sourceFilter, setSourceFilter] = useState<ErrorSource | undefined>()
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>()
  
  // Data fetching and mutations
  const { data, loading, refetch } = useSystemErrors({
    severity: severityFilter,
    source: sourceFilter,
    isResolved: resolvedFilter,
    limit: Infinity // fetch all errors
  })
  
  const { data: statsData } = useSystemErrorStats(24) // Last 24 hours
  const [resolveError, { loading: isResolving }] = useResolveSystemError()

  const errors = data?.getRecentSystemErrors || []
  
  // Parse stats
  let stats = {
    total: errors.length,
    active: errors.filter(e => !e.isResolved).length,
    resolved: errors.filter(e => e.isResolved).length,
    critical: errors.filter(e => e.severity === 'CRITICAL').length
  }

  // Action handlers
  const handleResolveError = async (errorId: string, resolutionNotes?: string) => {
    try {
      await resolveError({ 
        variables: { 
          errorId,
          resolutionNotes 
        } 
      })
      await refetch()
      console.log('Error marked as resolved')
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  const handleViewDetails = (error: SystemError) => {
    setSelectedError(error)
    setIsDetailsOpen(true)
  }

  const handleRefresh = async () => {
    await refetch()
    console.log('Data refreshed')
  }

  const clearFilters = () => {
    setSeverityFilter(undefined)
    setSourceFilter(undefined)
    setResolvedFilter(undefined)
  }

  const activeFiltersCount = [severityFilter, sourceFilter, resolvedFilter].filter(Boolean).length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="System Error History"
        subtitle="Monitor and manage application errors and exceptions"
      />

      {/* Stats Cards */}
      <SystemErrorsStatsCards stats={stats} />

      {/* Filters */}
      <SystemErrorsFilters
        severityFilter={severityFilter}
        sourceFilter={sourceFilter}
        resolvedFilter={resolvedFilter}
        setSeverityFilter={setSeverityFilter}
        setSourceFilter={setSourceFilter}
        setResolvedFilter={setResolvedFilter}
        handleRefresh={handleRefresh}
        clearFilters={clearFilters}
        loading={loading}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Error History
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {activeFiltersCount > 0 && (
                <Badge variant="outline">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SystemErrorsTable
            errors={errors}
            isLoading={loading}
            onResolve={(error) => handleResolveError(error.id)}
            onViewDetails={handleViewDetails}
            isResolving={isResolving}
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <SystemErrorDetailsDialog
        error={selectedError}
        open={isDetailsOpen}
        onResolve={handleResolveError}
        isResolving={isResolving}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedError(null)
        }}
      />
    </div>
  )
}
