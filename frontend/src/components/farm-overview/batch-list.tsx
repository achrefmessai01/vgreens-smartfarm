'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Batch } from '@/types/farm.types'
import { getVarietyById } from '@/lib/variety-data'

interface BatchListProps {
  batches: Batch[]
  selectedBatchId: string | null
  onSelectBatch: (batchId: string | null) => void
  batchesLabel: string
  onTimeLabel: string
  delayedLabel: string
  earlyLabel: string
  completeLabel: string
}

export function BatchList({
  batches,
  selectedBatchId,
  onSelectBatch,
  batchesLabel,
  onTimeLabel,
  delayedLabel,
  earlyLabel,
  completeLabel,
}: BatchListProps) {
  const getStatusLabel = (status: Batch['status']) => {
    switch (status) {
      case 'onTime':
        return onTimeLabel
      case 'delayed':
        return delayedLabel
      case 'early':
        return earlyLabel
      default:
        return onTimeLabel
    }
  }

  const getStatusColor = (status: Batch['status']) => {
    switch (status) {
      case 'onTime':
        return 'bg-green-500'
      case 'delayed':
        return 'bg-red-500'
      case 'early':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground">{batchesLabel}</h2>
      <div className="space-y-3 px-1">
        {batches.map((batch) => (
          <Card
            key={batch.id}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg border-2',
              selectedBatchId === batch.id
                ? 'ring-4 ring-primary/40 border-primary shadow-xl bg-primary/5'
                : 'border-border/60 hover:border-primary/40 hover:shadow-md bg-card/80'
            )}
            onClick={() =>
              onSelectBatch(selectedBatchId === batch.id ? null : batch.id)
            }
          >
            <CardContent className="px-4 py-0 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-bold text-base',
                    selectedBatchId === batch.id
                      ? 'text-primary'
                      : 'text-foreground'
                  )}
                >
                  {batch.name}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    selectedBatchId === batch.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {Math.round(batch.progress)}% {completeLabel}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <div
                  className={cn(
                    'text-sm font-medium',
                    selectedBatchId === batch.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {batch.cropName}
                </div>
                {batch.varietyId && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-semibold px-2.5 py-0.5',
                      selectedBatchId === batch.id &&
                        'bg-primary/20 text-primary border-primary/30'
                    )}
                  >
                    {getVarietyById(batch.varietyId)?.name || batch.varietyId}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full flex-shrink-0 shadow-sm',
                    getStatusColor(batch.status)
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    selectedBatchId === batch.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {getStatusLabel(batch.status)}
                </span>
              </div>
              <Progress
                value={batch.progress}
                className={cn(
                  'h-2.5',
                  selectedBatchId === batch.id && 'shadow-sm'
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
