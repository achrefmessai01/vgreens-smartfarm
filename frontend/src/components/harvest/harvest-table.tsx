'use client'

import * as React from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { HarvestRecord } from '@/lib/types/harvest'
import { cn } from '@/lib/utils'

interface HarvestTableProps {
  harvests: HarvestRecord[]
  onViewDetails?: (harvest: HarvestRecord) => void
}

export function HarvestTable({ harvests, onViewDetails }: HarvestTableProps) {
  return (
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Batch</TableHead>
            <TableHead className="font-medium">Greenhouse</TableHead>
            <TableHead className="font-medium">Class A (kg)</TableHead>
            <TableHead className="font-medium">Waste (kg)</TableHead>
            <TableHead className="font-medium">Avg Brix</TableHead>
            <TableHead className="font-medium">Photos</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {harvests.map((harvest) => (
            <TableRow 
              key={harvest.id} 
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onViewDetails?.(harvest)}
            >
              <TableCell className="font-medium">{harvest.date}</TableCell>
              <TableCell className="text-muted-foreground">
                {harvest.batch}
              </TableCell>
              <TableCell className="font-medium text-blue-600">
                GH{parseInt(harvest.id) % 2 === 1 ? '1' : '2'}
              </TableCell>
              <TableCell>
                <span className={cn(
                  'font-medium',
                  'text-green-600 dark:text-green-400'
                )}>
                  {harvest.classA}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  'font-medium',
                  'text-red-600 dark:text-red-400'
                )}>
                  {harvest.waste}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {harvest.avgBrix}°Bx
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {harvest.photos === 0 ? '-' : harvest.photos}
              </TableCell>
              <TableCell className="text-right">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
