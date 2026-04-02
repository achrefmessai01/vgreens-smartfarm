import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent System Errors ({errors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <p>No errors found matching your filters.</p>
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
