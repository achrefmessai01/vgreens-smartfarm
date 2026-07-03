'use client';

import * as React from 'react';
import { useGreenhousesQuery } from '@/generated/graphql';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useIrrigationCycleMutations,
  useIrrigationCycles,
  type IrrigationCycle,
} from '@/lib/hooks/use-irrigation-cycles';
import {
  useSoilSensorConfigs,
  type SoilSensorConfig,
} from '@/lib/hooks/use-sensor-calibration';
import { Droplets, Plus, Trash2, X } from 'lucide-react';

interface IrrigationCyclesConfigProps {
  tenantId: string;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Inline-editable cycle name — persists on blur/Enter when changed. */
function CycleNameInput({
  cycle,
  disabled,
  onRename,
}: {
  cycle: IrrigationCycle;
  disabled: boolean;
  onRename: (name: string) => void;
}) {
  const [name, setName] = React.useState(cycle.name);
  React.useEffect(() => setName(cycle.name), [cycle.name]);

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setName(cycle.name);
      return;
    }
    if (trimmed !== cycle.name) onRename(trimmed);
  };

  return (
    <Input
      value={name}
      disabled={disabled}
      onChange={(e) => setName(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className="h-8 max-w-56 text-sm font-medium"
      aria-label="Cycle name"
    />
  );
}

/**
 * Farm-Overview-Configuration section: create irrigation cycles (name +
 * greenhouse, tenant-scoped — a greenhouse can have many) and assign SOIL
 * sensors to them. Only soil sensors in the cycle's own greenhouse are
 * offered; the server enforces both rules again. The farm-overview
 * calibration dropdown lists these cycles.
 */
export function IrrigationCyclesConfig({
  tenantId,
}: IrrigationCyclesConfigProps) {
  const { data: greenhousesData } = useGreenhousesQuery({
    variables: { tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });
  const greenhouses = greenhousesData?.greenhouses ?? [];

  const { cycles, refetch: refetchCycles } = useIrrigationCycles(tenantId);
  const { configs: soilConfigs, refetch: refetchSoilConfigs } =
    useSoilSensorConfigs(tenantId);
  const { createCycle, renameCycle, deleteCycle, assignSensor, saving } =
    useIrrigationCycleMutations(tenantId);

  const [newName, setNewName] = React.useState('');
  const [newGreenhouseId, setNewGreenhouseId] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const runAction = React.useCallback(
    async (action: () => Promise<unknown>) => {
      setError(null);
      try {
        await action();
        // Assignments live on sensor_configs, so refresh both lists.
        await Promise.all([refetchCycles(), refetchSoilConfigs()]);
      } catch (e: unknown) {
        setError(errorMessage(e));
      }
    },
    [refetchCycles, refetchSoilConfigs],
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !newGreenhouseId) return;
    void runAction(async () => {
      await createCycle(name, newGreenhouseId);
      setNewName('');
    });
  };

  const sensorsOfCycle = (cycle: IrrigationCycle): SoilSensorConfig[] =>
    soilConfigs.filter((s) => s.irrigationCycleId === cycle.id);

  // Only soil sensors in the cycle's greenhouse that aren't grouped yet.
  const assignableFor = (cycle: IrrigationCycle): SoilSensorConfig[] =>
    soilConfigs.filter(
      (s) =>
        s.irrigationCycleId == null &&
        cycle.greenhouseId != null &&
        s.greenhouseId === cycle.greenhouseId,
    );

  return (
    <div className="bg-card border-border/60 rounded-xl border shadow-sm">
      <div className="border-border/40 border-b px-6 py-4">
        <h3 className="text-sm font-semibold">Irrigation cycles</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Group a greenhouse&apos;s soil sensors into irrigation cycles — the
          farm overview calibrates per cycle. Only soil sensors in the
          cycle&apos;s greenhouse can be assigned.
        </p>
      </div>

      <div className="space-y-4 p-6">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1.5">
            <label
              htmlFor="new-cycle-name"
              className="text-muted-foreground text-xs font-medium"
            >
              Cycle name
            </label>
            <Input
              id="new-cycle-name"
              value={newName}
              disabled={saving}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Bed A morning cycle"
              className="h-9"
            />
          </div>
          <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1.5">
            <label
              htmlFor="new-cycle-greenhouse"
              className="text-muted-foreground text-xs font-medium"
            >
              Greenhouse
            </label>
            <Select
              value={newGreenhouseId}
              onValueChange={setNewGreenhouseId}
              disabled={saving}
            >
              <SelectTrigger id="new-cycle-greenhouse" className="h-9 w-full">
                <SelectValue placeholder="Select greenhouse" />
              </SelectTrigger>
              <SelectContent>
                {greenhouses.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-xs">
                    No greenhouses configured
                  </div>
                ) : (
                  greenhouses.map((gh) => (
                    <SelectItem key={gh.id} value={gh.id}>
                      {gh.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9"
            disabled={saving || !newName.trim() || !newGreenhouseId}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add cycle
          </Button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {cycles.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No irrigation cycles yet.
          </p>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => {
              const assigned = sensorsOfCycle(cycle);
              const assignable = assignableFor(cycle);
              return (
                <div
                  key={cycle.id}
                  className="border-border/60 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Droplets className="text-primary h-4 w-4 shrink-0" />
                    <CycleNameInput
                      cycle={cycle}
                      disabled={saving}
                      onRename={(name) =>
                        void runAction(() => renameCycle(cycle.id, name))
                      }
                    />
                    <Badge variant="secondary" className="text-[10px]">
                      {cycle.greenhouse ?? 'No greenhouse'}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive ml-auto h-8 px-2"
                      disabled={saving}
                      onClick={() =>
                        void runAction(() => deleteCycle(cycle.id))
                      }
                      aria-label={`Delete cycle ${cycle.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {assigned.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        No sensors assigned.
                      </span>
                    ) : (
                      assigned.map((sensor) => (
                        <Badge
                          key={sensor.id}
                          variant="outline"
                          className="gap-1 pr-1 text-xs font-normal"
                        >
                          {sensor.device}
                          <button
                            type="button"
                            className="opacity-60 hover:opacity-100"
                            disabled={saving}
                            onClick={() =>
                              void runAction(() =>
                                assignSensor(sensor.id, null),
                              )
                            }
                            aria-label={`Unassign ${sensor.device}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className="mt-3 max-w-72">
                    <Select
                      value=""
                      disabled={saving || assignable.length === 0}
                      onValueChange={(sensorId) =>
                        void runAction(() => assignSensor(sensorId, cycle.id))
                      }
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue
                          placeholder={
                            assignable.length === 0
                              ? 'No unassigned soil sensors in this greenhouse'
                              : 'Assign soil sensor…'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assignable.map((sensor) => (
                          <SelectItem key={sensor.id} value={sensor.id}>
                            {sensor.device}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
