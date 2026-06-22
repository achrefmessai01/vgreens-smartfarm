'use client';

import * as React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_VALUE = '__all__';

interface DeviceGroupFilterProps {
  groups: string[];
  value: string;
  onChange: (group: string) => void;
  className?: string;
}

/**
 * Dynamic device-group filter. The options come from the device names
 * (e.g. Air, Soil, vgreens) so new families appear automatically.
 */
export function DeviceGroupFilter({
  groups,
  value,
  onChange,
  className,
}: DeviceGroupFilterProps) {
  const { t } = useI18n();
  const g = t.pages.deviceStatus.group;

  if (groups.length === 0) return null;

  return (
    <Select
      value={value || ALL_VALUE}
      onValueChange={(v) => onChange(v === ALL_VALUE ? '' : v)}
    >
      <SelectTrigger
        className={cn('h-9 w-44', className)}
        aria-label={g.ariaLabel}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE} className="text-sm">
          <Layers className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
          <span>{g.all}</span>
        </SelectItem>
        {groups.map((group) => (
          <SelectItem key={group} value={group} className="text-sm">
            <Layers className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
            <span>{group}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
