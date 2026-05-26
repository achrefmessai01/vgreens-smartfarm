'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { CheckCircle } from 'lucide-react';
import { SystemErrorCard, SystemErrorData } from './system-error-card';

interface SystemErrorsListProps {
  errors: SystemErrorData[];
  onResolveError: (id: string) => void;
}

export function SystemErrorsList({
  errors,
  onResolveError,
}: SystemErrorsListProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t.pages.admin.systemErrors.recentSystemErrors.replace(
            '{count}',
            String(errors.length),
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <p>{t.pages.admin.systemErrors.noErrorsMatch}</p>
            </div>
          ) : (
            errors.map((error) => (
              <SystemErrorCard
                key={error.id}
                error={error}
                onResolve={onResolveError}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
