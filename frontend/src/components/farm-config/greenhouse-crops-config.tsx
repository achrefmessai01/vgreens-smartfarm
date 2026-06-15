'use client';

import * as React from 'react';
import { Sprout } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/i18n';
import {
  useCropsQuery,
  useGreenhousesQuery,
  useAssignCropToGreenhouseMutation,
  useUnassignCropFromGreenhouseMutation,
} from '@/generated/graphql';

interface GreenhouseCropsConfigProps {
  tenantId: string;
}

// Per-greenhouse checklist of the global crop catalog. Ticking a crop assigns it
// to that greenhouse (greenhouse_crops); unticking removes it. The catalog
// itself is read-only — maintained by vGreens Admin outside this app.
export function GreenhouseCropsConfig({
  tenantId,
}: GreenhouseCropsConfigProps) {
  const { t } = useI18n();
  const ca = t.pages.admin.tenants.cropAssignment;

  const { data: greenhouseData } = useGreenhousesQuery({
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  const { data: cropData, loading: cropsLoading } = useCropsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const greenhouses = greenhouseData?.greenhouses ?? [];
  const crops = cropData?.crops ?? [];

  return (
    <div className="bg-card border-border/60 rounded-xl border shadow-sm">
      <div className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold">{ca.title}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">{ca.subtitle}</p>
        </div>
        <Sprout className="text-muted-foreground h-4 w-4" />
      </div>

      <div className="space-y-3 p-6">
        {greenhouses.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ca.noGreenhouses}</p>
        ) : cropsLoading && crops.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ca.loading}</p>
        ) : crops.length === 0 ? (
          <p className="text-muted-foreground text-sm">{ca.noCrops}</p>
        ) : (
          greenhouses.map((g) => (
            <GreenhouseCropRow
              key={g.id}
              greenhouseId={g.id}
              greenhouseName={g.name}
              crops={crops}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface GreenhouseCropRowProps {
  greenhouseId: string;
  greenhouseName: string;
  crops: { id: string; name: string }[];
}

function GreenhouseCropRow({
  greenhouseId,
  greenhouseName,
  crops,
}: GreenhouseCropRowProps) {
  const { data, refetch } = useCropsQuery({
    variables: { greenhouseId },
    fetchPolicy: 'cache-and-network',
  });
  const [assignCrop] = useAssignCropToGreenhouseMutation();
  const [unassignCrop] = useUnassignCropFromGreenhouseMutation();
  const [pending, setPending] = React.useState<string | null>(null);

  const assignedIds = React.useMemo(
    () => new Set((data?.crops ?? []).map((c) => c.id)),
    [data],
  );

  const toggle = async (cropId: string, assigned: boolean) => {
    setPending(cropId);
    try {
      if (assigned) {
        await unassignCrop({ variables: { greenhouseId, cropId } });
      } else {
        await assignCrop({ variables: { greenhouseId, cropId } });
      }
      await refetch();
    } catch (err) {
      console.error('Failed to update greenhouse crop assignment:', err);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="bg-muted/30 border-border/60 rounded-lg border">
      <div className="border-border/40 border-b px-4 py-2.5">
        <span className="text-sm font-medium">{greenhouseName}</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 p-4">
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
    </div>
  );
}
