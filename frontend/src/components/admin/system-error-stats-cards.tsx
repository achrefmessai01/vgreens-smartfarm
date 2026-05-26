'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { AlertTriangle, XCircle } from 'lucide-react';

interface SystemErrorStatsData {
  stats?: { length?: number };
  unresolved?: number;
  critical?: number;
}

interface SystemErrorStatsCardsProps {
  stats: SystemErrorStatsData | null;
  loading?: boolean;
}

export function SystemErrorStatsCards({
  stats,
  loading,
}: SystemErrorStatsCardsProps) {
  const { t } = useI18n();

  if (loading || !stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t.pages.admin.systemErrors.totalErrors24h}
          </CardTitle>
          <AlertTriangle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.stats?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t.pages.admin.systemErrors.unresolved}
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.unresolved || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t.pages.admin.systemErrors.criticalErrors}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.critical || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
