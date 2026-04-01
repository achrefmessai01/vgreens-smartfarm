'use client';

import * as React from 'react';
import { Columns2, Rows3, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
    hint: 'Number of bay columns per greenhouse',
    icon: Columns2,
    defaultVal: DEFAULT_FARM_CONFIG.bayCount,
  },
  {
    key: 'chambersCount' as const,
    label: 'Number of Greenhouses',
    hint: 'Total number of greenhouse chambers',
    icon: Building,
    defaultVal: DEFAULT_FARM_CONFIG.chambersCount,
  },
  {
    key: 'polesMax' as const,
    label: 'Pole Rows',
    hint: 'Number of pole rows (vertical positions per bay)',
    icon: Rows3,
    defaultVal: DEFAULT_FARM_CONFIG.polesMax,
  },
];

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
    <div className="bg-card border-border/60 rounded-xl border p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Farm Layout</h3>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Configure the farm grid dimensions for the sensor map.
        </p>
      </div>

      <Separator className="mb-5" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {FIELDS.map(({ key, label, hint, icon: Icon }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label
              htmlFor={`farm-${key}`}
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <Icon className="text-muted-foreground h-3.5 w-3.5" />
              {label}
            </Label>
            <Input
              id={`farm-${key}`}
              type="number"
              min={1}
              value={values[key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="h-9 w-32"
            />
            <p className="text-muted-foreground text-xs">{hint}</p>
          </div>
        ))}

        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={saving} className="min-w-16">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
