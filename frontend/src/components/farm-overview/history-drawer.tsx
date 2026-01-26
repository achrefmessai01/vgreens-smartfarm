'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { StyledSelect } from '@/components/ui/styled-select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ParameterType } from '@/lib/farm-types'
import { generateHistoryDataForParameter } from '@/lib/farm-history-data'

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parameter: ParameterType
  slotId: string | null
  parameterLabel: string
  timeRangeLabel: string
  oneDayLabel: string
  oneWeekLabel: string
  oneMonthLabel: string
  historyLabel: string
}

export function HistoryDrawer({
  open,
  onOpenChange,
  parameter,
  slotId,
  parameterLabel,
  timeRangeLabel,
  oneDayLabel,
  oneWeekLabel,
  oneMonthLabel,
  historyLabel,
}: HistoryDrawerProps) {
  const [timeRange, setTimeRange] = React.useState<'1day' | '1week' | '1month'>(
    '1month'
  )
  const [selectedPointIndex, setSelectedPointIndex] = React.useState<
    number | null
  >(null)

  const historyData = React.useMemo(() => {
    if (!slotId) return []
    const data = generateHistoryDataForParameter(parameter, timeRange)
    // Format data for Recharts with index for point selection
    return data.map((point, index) => ({
      timestamp: point.timestamp.getTime(),
      value: point.value,
      index,
    }))
  }, [parameter, timeRange, slotId])

  // Reset selected point when slot or parameter changes
  React.useEffect(() => {
    setSelectedPointIndex(null)
  }, [slotId, parameter, timeRange])

  if (!slotId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>
            {historyLabel} - {parameterLabel}
          </SheetTitle>
          <SheetDescription>{slotId}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium ml-5">
              {timeRangeLabel}:
            </label>
            <StyledSelect
              value={timeRange}
              onValueChange={(value) =>
                setTimeRange(value as '1day' | '1week' | '1month')
              }
              options={[
                { label: oneDayLabel, value: '1day' },
                { label: oneWeekLabel, value: '1week' },
                { label: oneMonthLabel, value: '1month' },
              ]}
              width="180px"
            />
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleString()
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#016F7C"
                  strokeWidth={2}
                  dot={(props: {
                    cx?: number
                    cy?: number
                    payload?: {
                      timestamp: number
                      value: number
                      index: number
                    }
                    index?: number
                  }) => {
                    if (!props.cx || !props.cy || !props.payload) {
                      return <g />
                    }
                    const pointIndex = props.payload.index ?? props.index ?? -1
                    if (pointIndex === -1) return <g />
                    const isSelected = selectedPointIndex === pointIndex
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={isSelected ? 6 : 4}
                        fill="#016F7C"
                        stroke="white"
                        strokeWidth={isSelected ? 3 : 1.5}
                        className="cursor-pointer transition-all hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPointIndex(isSelected ? null : pointIndex)
                        }}
                        style={{
                          filter: isSelected
                            ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))'
                            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                        }}
                      />
                    )
                  }}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
