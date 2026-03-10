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
  defaultValue = 'today' 
}: DashboardFiltersProps) {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>(defaultValue);

  const handleFilterChange = (value: DateFilter) => {
    setSelectedFilter(value);
    onFilterChange?.({ dateFilter: value });
  };

  // Define filter options with simple labels
  const filterOptions = [
    {
      value: 'today' as DateFilter,
      label: (t.common as any)?.today || (t.pages.harvest as any)?.today || 'Today'
    },
    {
      value: 'thisWeek' as DateFilter,
      label: (t.common as any)?.thisWeek || (t.pages.harvest as any)?.thisWeek || 'This Week'
    },
    {
      value: 'lastWeek' as DateFilter,
      label: (t.common as any)?.lastWeek || (t.pages.harvest as any)?.lastWeek || 'Last Week'
    },
    {
      value: 'thisMonth' as DateFilter,
      label: (t.common as any)?.thisMonth || (t.pages.harvest as any)?.thisMonth || 'This Month'
    },
    {
      value: 'lastMonth' as DateFilter,
      label: (t.common as any)?.lastMonth || (t.pages.harvest as any)?.lastMonth || 'Last Month'
    },
    {
      value: 'total' as DateFilter,
      label: (t.common as any)?.total || (t.pages.harvest as any)?.total || 'Total'
    }
  ];

  return (
    <div className={className}>
      <Select value={selectedFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={(t.common as any)?.selectPeriod || 'Select period'} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}