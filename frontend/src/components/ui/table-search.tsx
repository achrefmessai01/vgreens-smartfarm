'use client';

import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface TableSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TableSearch({
  placeholder,
  value,
  onChange,
  className,
}: TableSearchProps) {
  const { t } = useI18n();

  placeholder = placeholder ?? t.common.searchPlaceholder;
  return (
    <div className={cn('relative max-w-md min-w-0 flex-1', className)}>
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border/60 bg-background focus-visible:ring-primary/20 h-9 rounded-lg pl-9 focus-visible:ring-2"
      />
    </div>
  );
}
