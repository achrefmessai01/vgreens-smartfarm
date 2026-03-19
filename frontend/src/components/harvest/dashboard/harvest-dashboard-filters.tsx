import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { type DateFilter } from '@/lib/hooks/use-harvest-dashboard';

export interface DashboardFiltersProps {
  onFilterChange?: (filter: { dateFilter?: DateFilter }) => void;
  className?: string;
  defaultValue?: DateFilter;
}

export function DashboardFilters({
  onFilterChange,
  className,
  defaultValue = 'thisMonth',
}: DashboardFiltersProps) {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] =
    useState<DateFilter>(defaultValue);

  const handleFilterChange = (value: DateFilter) => {
    setSelectedFilter(value);
    onFilterChange?.({ dateFilter: value });
  };

  const filterOptions = [
    {
      value: 'today' as DateFilter,
      label: t.common?.today || 'Today',
    },
    {
      value: 'thisWeek' as DateFilter,
      label: t.common?.thisWeek || 'This Week',
    },
    {
      value: 'lastWeek' as DateFilter,
      label: t.common?.lastWeek || 'Last Week',
    },
    {
      value: 'thisMonth' as DateFilter,
      label: t.common?.thisMonth || 'This Month',
    },
    {
      value: 'lastMonth' as DateFilter,
      label: t.common?.lastMonth || 'Last Month',
    },
    {
      value: 'total' as DateFilter,
      label: t.common?.total || t.pages.harvest?.total || 'Total',
    },
  ];

  return (
    <div className={className}>
      <Select value={selectedFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={t.common.selectPeriod || 'Select period'} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
