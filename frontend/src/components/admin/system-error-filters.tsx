'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { Search } from 'lucide-react';

interface SystemErrorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSeverity: string;
  onSeverityChange: (value: string) => void;
  selectedSource: string;
  onSourceChange: (value: string) => void;
  showResolved: boolean;
  onShowResolvedChange: (value: boolean) => void;
}

export function SystemErrorFilters({
  searchTerm,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedSource,
  onSourceChange,
  showResolved,
  onShowResolvedChange,
}: SystemErrorFiltersProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.common.filters}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={t.pages.admin.systemErrors.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={selectedSeverity} onValueChange={onSeverityChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={t.pages.admin.systemErrors.allSeverities}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t.pages.admin.systemErrors.allSeverities}
              </SelectItem>
              <SelectItem value="CRITICAL">
                {t.pages.admin.reports.severities.critical}
              </SelectItem>
              <SelectItem value="URGENT">
                {t.pages.admin.reports.severities.urgent}
              </SelectItem>
              <SelectItem value="HIGH">
                {t.pages.admin.reports.severities.high}
              </SelectItem>
              <SelectItem value="MEDIUM">
                {t.pages.admin.reports.severities.medium}
              </SelectItem>
              <SelectItem value="LOW">
                {t.pages.admin.reports.severities.low}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSource} onValueChange={onSourceChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={t.pages.admin.systemErrors.allSources}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t.pages.admin.systemErrors.allSources}
              </SelectItem>
              <SelectItem value="FRONTEND">
                {t.pages.admin.systemErrors.sourceLabels.frontend}
              </SelectItem>
              <SelectItem value="BACKEND">
                {t.pages.admin.systemErrors.sourceLabels.backend}
              </SelectItem>
              <SelectItem value="DATABASE">
                {t.pages.admin.systemErrors.sourceLabels.database}
              </SelectItem>
              <SelectItem value="EXTERNAL_API">
                {t.pages.admin.systemErrors.sourceLabels.externalApi}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showResolved"
              checked={showResolved}
              onChange={(e) => onShowResolvedChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showResolved" className="text-sm">
              {t.pages.admin.systemErrors.showResolved}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
