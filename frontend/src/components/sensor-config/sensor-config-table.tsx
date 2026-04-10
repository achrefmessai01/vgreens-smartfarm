'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useI18n } from '@/i18n';
import { SENSOR_CONFIG_FIELD_KEYS } from '@/lib/sensor-config-constants';
import { Pencil } from 'lucide-react';
import * as React from 'react';
import { SensorConfigForm } from './sensor-config-form';
import { useSensorConfig, type SensorRow } from './use-sensor-config';

interface SensorConfigTableProps {
  tenantId: string;
}

export function SensorConfigTable({ tenantId }: SensorConfigTableProps) {
  const { t } = useI18n();
  const sc = t.pages.admin.tenants.sensorConfig;

  const { rows, loading, saving, handleSave, handleDelete } =
    useSensorConfig(tenantId);
  const [editingRow, setEditingRow] = React.useState<SensorRow | null>(null);

  if (loading) {
    return <TableSkeleton columnCount={5} rowCount={6} showHeader />;
  }

  const columnLabels: Record<
    (typeof SENSOR_CONFIG_FIELD_KEYS)[number],
    string
  > = {
    xPosition: sc.xPosition,
    yPosition: sc.yPosition,
    greenhouse: sc.greenhouse,
  };

  return (
    <>
      <div className="border-border/60 overflow-hidden rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">{sc.device}</TableHead>
              {SENSOR_CONFIG_FIELD_KEYS.map((key) => (
                <TableHead key={key}>{columnLabels[key]}</TableHead>
              ))}
              <TableHead className="text-right">{sc.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {sc.noSensorsFound}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ device, config }) => (
                <TableRow
                  key={device}
                  className="cursor-pointer"
                  onClick={() => setEditingRow({ device, config })}
                >
                  <TableCell className="font-medium">{device}</TableCell>
                  <TableCell>
                    {config?.xPosition != null ? (
                      <Badge variant="secondary">{config.xPosition}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {config?.yPosition != null ? (
                      <Badge variant="secondary">{config.yPosition}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {config?.greenhouse ?? (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRow({ device, config });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={!!editingRow}
        onOpenChange={(open) => !open && setEditingRow(null)}
      >
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b px-6 pt-6 pb-4">
            <SheetTitle>{editingRow?.device}</SheetTitle>
            <SheetDescription>{sc.sheetDescription}</SheetDescription>
          </SheetHeader>
          {editingRow && (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SensorConfigForm
                row={editingRow}
                tenantId={tenantId}
                onSave={handleSave}
                onDelete={handleDelete}
                saving={saving}
                onClose={() => setEditingRow(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
