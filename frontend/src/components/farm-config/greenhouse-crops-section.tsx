'use client';

import * as React from 'react';
import { Sprout } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/i18n';
import {
  useCropsQuery,
  useAssignCropToGreenhouseMutation,
  useUnassignCropFromGreenhouseMutation,
} from '@/generated/graphql';

interface GreenhouseCropsSectionProps {
  greenhouseId: string;
}

// Checklist of the global crop catalog for one saved greenhouse, rendered
// inside its Farm Layout card. Ticking a crop assigns it to the greenhouse
// (greenhouse_crops); unticking removes it. The catalog itself is read-only —
// maintained by vGreens Admin outside this app.
export function GreenhouseCropsSection({
  greenhouseId,
}: GreenhouseCropsSectionProps) {
  const { t } = useI18n();
  const ca = t.pages.admin.tenants.cropAssignment;

  const { data: catalogData, loading: catalogLoading } = useCropsQuery({
    fetchPolicy: 'cache-and-network',
  });
  const crops = catalogData?.crops ?? [];

  const { data: assignedData, refetch } = useCropsQuery({
    variables: { greenhouseId },
    fetchPolicy: 'cache-and-network',
  });
  const [assignCrop] = useAssignCropToGreenhouseMutation();
  const [unassignCrop] = useUnassignCropFromGreenhouseMutation();
  const [pending, setPending] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const assignedIds = React.useMemo(
    () => new Set((assignedData?.crops ?? []).map((c) => c.id)),
    [assignedData],
  );

  const toggle = async (cropId: string, assigned: boolean) => {
    setPending(cropId);
    setError(null);
    try {
      if (assigned) {
        await unassignCrop({ variables: { greenhouseId, cropId } });
      } else {
        await assignCrop({ variables: { greenhouseId, cropId } });
      }
      await refetch();
    } catch (err) {
      console.error('Failed to update greenhouse crop assignment:', err);
      setError(ca.updateFailed);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="border-border/40 border-t px-4 py-3">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
        <Sprout className="h-3.5 w-3.5" />
        {ca.title}
      </div>
      {error && (
        <div className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
          {error}
        </div>
      )}
      {catalogLoading && crops.length === 0 ? (
        <p className="text-muted-foreground text-sm">{ca.loading}</p>
      ) : crops.length === 0 ? (
        <p className="text-muted-foreground text-sm">{ca.noCrops}</p>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {crops.map((c) => {
            const assigned = assignedIds.has(c.id);
            return (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 text-sm select-none"
              >
                <Checkbox
                  checked={assigned}
                  disabled={pending === c.id}
                  onCheckedChange={() => void toggle(c.id, assigned)}
                />
                {c.name}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
