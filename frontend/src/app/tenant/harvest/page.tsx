'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { FeatureGuard } from '@/components/features/feature-guard'
import {
  HarvestTable,
  HarvestPageHeader,
  HarvestPageSkeleton,
  HarvestDetails,
  CreateBatchDialog,
  BatchSidebar,
} from '@/components/harvest'
import { getAllHarvests, getHarvestSummary, addNewHarvest, addCompletedBatchToHistory } from '@/lib/harvest-data'
import { createBatchDetailsFromForm } from '@/lib/utils/batch-utils'
import { usePagination } from '@/lib/hooks/use-pagination'
import { Pagination } from '@/components/ui/pagination'
import type { HarvestRecord, HarvestSummary } from '@/lib/types/harvest'
import type { BatchFormData } from '@/lib/types/batch'
import type { BatchDetailsData } from '@/components/harvest/batch-sidebar-types'

export default function HarvestPage() {
  const { t } = useI18n()
  const [harvests, setHarvests] = React.useState<HarvestRecord[]>([])
  const [allHarvests, setAllHarvests] = React.useState<HarvestRecord[]>([])
  const [summary, setSummary] = React.useState<HarvestSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedHarvest, setSelectedHarvest] = React.useState<HarvestRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [createBatchOpen, setCreateBatchOpen] = React.useState(false)
  const [isCreatingBatch, setIsCreatingBatch] = React.useState(false)
  
  // Batch sidebar state
  const [batchSidebarOpen, setBatchSidebarOpen] = React.useState(false)
  const [selectedBatch, setSelectedBatch] = React.useState<BatchDetailsData | null>(null)

  const {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNext,
    goToPrevious,
    getPageItems,
    startItem,
    endItem,
  } = usePagination({
    totalItems: allHarvests.length,
    itemsPerPage: 15,
  })

  React.useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const harvestData = getAllHarvests()
      const summaryData = getHarvestSummary()
      
      setAllHarvests(harvestData)
      setSummary(summaryData)
      setLoading(false)
    }

    loadData()
  }, [])

  // Update paginated harvests when all harvests or current page changes
  React.useEffect(() => {
    const paginatedHarvests = getPageItems(allHarvests)
    setHarvests(paginatedHarvests)
  }, [allHarvests, getPageItems])

  const handleViewDetails = (harvest: HarvestRecord) => {
    setSelectedHarvest(harvest)
    setDetailsOpen(true)
  }

  const handleCreateBatch = () => {
    setCreateBatchOpen(true)
  }

  const handleBatchSubmit = async (data: BatchFormData) => {
    setIsCreatingBatch(true)
    try {
      // Create batch details for sidebar (without adding to history)
      const batchDetails = createBatchDetailsFromForm(data)
      
      // Close create dialog and open batch sidebar
      setCreateBatchOpen(false)
      setSelectedBatch(batchDetails)
      setBatchSidebarOpen(true)
    } catch (error) {
      console.error('Error creating batch:', error)
      // Handle error (show notification, etc.)
    } finally {
      setIsCreatingBatch(false)
    }
  }

  if (loading || !summary) {
    return (
      <FeatureGuard 
        featureKey="harvest_management" 
        skeleton={<HarvestPageSkeleton />}
      >
        <HarvestPageSkeleton />
      </FeatureGuard>
    )
  }

  return (
    <FeatureGuard featureKey="harvest_management">
      <div className="space-y-6">
        <HarvestPageHeader 
          summary={summary || {
            totalHarvests: 0,
            variety: 'Loading...',
            totalClassA: 0,
            totalWaste: 0,
            avgBrix: 0,
          }} 
          title={t.pages.harvest?.title || 'Harvest History'}
          onCreateBatch={handleCreateBatch}
          isLoading={loading || isCreatingBatch}
        />
        
        <HarvestTable 
          harvests={harvests} 
          onViewDetails={handleViewDetails} 
        />
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={goToPage}
            onNext={goToNext}
            onPrevious={goToPrevious}
            startItem={startItem}
            endItem={endItem}
            totalItems={allHarvests.length}
          />
        )}
        
        <HarvestDetails
          harvest={selectedHarvest}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
        
        <CreateBatchDialog
          open={createBatchOpen}
          onOpenChange={setCreateBatchOpen}
          onSubmit={handleBatchSubmit}
          isLoading={isCreatingBatch}
        />
        
        <BatchSidebar
          open={batchSidebarOpen}
          onOpenChange={setBatchSidebarOpen}
          batchData={selectedBatch}
          onEdit={(batch: BatchDetailsData) => {
            // TODO: Implement batch editing
            console.log('Edit batch:', batch)
          }}
          onComplete={(batch: BatchDetailsData) => {
            try {
              // Add completed batch to harvest history
              const newHarvest = addCompletedBatchToHistory(batch)
              
              // Update the harvest data
              const updatedHarvests = getAllHarvests()
              setAllHarvests(updatedHarvests)
              
              // Update summary
              const updatedSummary = getHarvestSummary()
              setSummary(updatedSummary)
              
              // Go to first page to show the new harvest and update display
              goToPage(1)
              
              // Update batch status and close sidebar
              setSelectedBatch({ ...batch, status: 'completed' })
              setBatchSidebarOpen(false)
              
              console.log('Batch completed and added to harvest history:', newHarvest)
            } catch (error) {
              console.error('Error completing batch:', error)
            }
          }}
          onPhotoUpload={(files: File[]) => {
            // TODO: Implement photo upload
            console.log('Upload photos:', files)
          }}
        />
      </div>
    </FeatureGuard>
  )
}