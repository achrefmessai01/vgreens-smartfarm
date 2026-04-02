'use client';

import * as React from 'react';
import { Columns2, Rows3, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useFarmConfigQuery,
  useUpsertFarmConfigMutation,
} from '@/generated/graphql';
import { DEFAULT_FARM_CONFIG } from '@/lib/farm-config-constants';

interface FarmLayoutConfigProps {
  tenantId: string;
}

const FIELDS = [
  {
    key: 'bayCount' as const,
    label: 'Bay Count',
    hint: 'Columns per greenhouse',
    icon: Columns2,
  },
  {
    key: 'chambersCount' as const,
    label: 'Greenhouses',
    hint: 'Total chambers',
    icon: Building,
  },
  {
    key: 'polesMax' as const,
    label: 'Pole Rows',
    hint: 'Vertical positions',
    icon: Rows3,
  },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

export function FarmLayoutConfig({ tenantId }: FarmLayoutConfigProps) {
  const { data, refetch } = useFarmConfigQuery({
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  const [upsert] = useUpsertFarmConfigMutation();
  const [saving, setSaving] = React.useState(false);

  const current = data?.farmConfig;
  const [values, setValues] = React.useState<Record<FieldKey, string>>({
    bayCount: String(DEFAULT_FARM_CONFIG.bayCount),
    chambersCount: String(DEFAULT_FARM_CONFIG.chambersCount),
    polesMax: String(DEFAULT_FARM_CONFIG.polesMax),
  });

  React.useEffect(() => {
    if (current) {
      setValues({
        bayCount: String(current.bayCount),
        chambersCount: String(current.chambersCount),
        polesMax: String(current.polesMax),
      });
    }
  }, [current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bay = parseInt(values.bayCount, 10);
    const chambers = parseInt(values.chambersCount, 10);
    const poles = parseInt(values.polesMax, 10);
    if ([bay, chambers, poles].some((n) => !Number.isFinite(n) || n < 1)) return;
    setSaving(true);
    try {
      await upsert({
        variables: {
          input: { bayCount: bay, chambersCount: chambers, polesMax: poles },
          tenantId,
        },
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border-border/60 rounded-xl border shadow-sm">
      <div className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold">Farm Layout</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure the grid dimensions for the sensor map
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          className="min-w-16"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 divide-x">
        {FIELDS.map(({ key, label, hint, icon: Icon }) => (
          <div key={key} className="flex flex-col gap-3 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>
              </div>
            </div>
            <Input
              id={`farm-${key}`}
              type="number"
              min={1}
              value={values[key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="h-9"
            />
          </div>
        ))}
      </form>
    </div>
  );
}
