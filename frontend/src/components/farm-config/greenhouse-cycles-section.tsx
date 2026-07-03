'use client';

import * as React from 'react';
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

interface GreenhouseCyclesSectionProps {
  tenantId: string;
  greenhouseId: string;
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
 * One saved greenhouse's irrigation cycles, rendered inside its Farm Layout
 * card: create cycles (name only — the greenhouse is implied by the card) and
 * assign the greenhouse's SOIL sensors to them. The server enforces both the
 * soil-only and same-greenhouse rules again. The farm-overview calibration
 * dropdown lists these cycles.
 */
export function GreenhouseCyclesSection({
  tenantId,
  greenhouseId,
}: GreenhouseCyclesSectionProps) {
  const { cycles: allCycles, refetch: refetchCycles } =
    useIrrigationCycles(tenantId);
  const { configs: soilConfigs, refetch: refetchSoilConfigs } =
    useSoilSensorConfigs(tenantId);
  const { createCycle, renameCycle, deleteCycle, assignSensor, saving } =
    useIrrigationCycleMutations(tenantId);

  const cycles = allCycles.filter((c) => c.greenhouseId === greenhouseId);

  const [newName, setNewName] = React.useState('');
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
    if (!name) return;
    void runAction(async () => {
      await createCycle(name, greenhouseId);
      setNewName('');
    });
  };

  const sensorsOfCycle = (cycle: IrrigationCycle): SoilSensorConfig[] =>
    soilConfigs.filter((s) => s.irrigationCycleId === cycle.id);

  // Only this greenhouse's soil sensors that aren't grouped yet.
  const assignable = soilConfigs.filter(
    (s) => s.irrigationCycleId == null && s.greenhouseId === greenhouseId,
  );

  return (
    <div className="border-border/40 border-t px-4 py-3">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
        <Droplets className="h-3.5 w-3.5" />
        Irrigation cycles
      </div>

      <div className="space-y-3">
        <form onSubmit={handleCreate} className="flex items-end gap-2">
          <div className="flex max-w-72 min-w-0 flex-1 flex-col gap-1.5">
            <label
              htmlFor={`new-cycle-name-${greenhouseId}`}
              className="text-muted-foreground text-xs font-medium"
            >
              Cycle name
            </label>
            <Input
              id={`new-cycle-name-${greenhouseId}`}
              value={newName}
              disabled={saving}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Bed A morning cycle"
              className="h-9"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9"
            disabled={saving || !newName.trim()}
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
              return (
                <div
                  key={cycle.id}
                  className="border-border/60 bg-card rounded-lg border p-4"
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
