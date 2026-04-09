import type {
  Bay,
  PlantSlot,
  ParameterValue,
  Row,
  Column,
} from '@/types/farm.types';

/**
 * PostgreSQL SensorConfig override values for a single device.
 * xPosition/yPosition are in meters, relative to the greenhouse origin.
 */
export interface SensorConfigOverride {
  greenhouse?: string | null;
  city?: string | null;
  xPosition?: number | null;
  yPosition?: number | null;
}

/** One row from getBucketData (each item has a "data" object). */
export type InfluxDBRow = Record<string, unknown> & {
  _field?: string;
  _value?: number;
  _time?: string;
  chamber?: string;
  greenhouse?: string;
  device?: string;
  level?: string;
  area?: string;
};

const SENSOR_COLS = 4;
const SENSOR_ROWS = 8;
const GRID_SIZE = SENSOR_COLS * SENSOR_ROWS;

function buildSlotsFromRows(
  rows: InfluxDBRow[],
  sensorConfigs?: Map<string, SensorConfigOverride>,
): PlantSlot[] {
  type SlotKey = string;
  type FieldValues = Record<string, { value: number; time: string }>;
  type SlotMeta = {
    _start?: string;
    _stop?: string;
    _time?: string;
    _measurement?: string;
    area?: string;
    profile?: string;
    side?: string;
    xPosition?: number;
    yPosition?: number;
  };

  const bySlot = new Map<SlotKey, FieldValues>();
  const metaBySlot = new Map<SlotKey, SlotMeta>();

  for (const row of rows) {
    const influxGreenhouse =
      (row.greenhouse as string) ?? (row.chamber as string) ?? '';
    const device = (row.device as string) ?? '';
    const config = device ? sensorConfigs?.get(device) : undefined;
    const chamberOrGreenhouse =
      (config?.greenhouse ?? influxGreenhouse) || influxGreenhouse;
    const level = (row.level as string) ?? '';
    const key: SlotKey = `${chamberOrGreenhouse}|${device}|${level}`;
    const field = (row._field as string) ?? '';
    if (!field) continue;
    const value =
      typeof row._value === 'number' ? row._value : Number(row._value) || 0;
    const time = (row._time as string) ?? '';

    const existing = bySlot.get(key) ?? ({} as FieldValues);
    const existingEntry = existing[field];
    if (!existingEntry || time > existingEntry.time) {
      existing[field] = { value, time };
      bySlot.set(key, existing);
    }

    const xPos =
      typeof config?.xPosition === 'number' ? config.xPosition : undefined;
    const yPos =
      typeof config?.yPosition === 'number' ? config.yPosition : undefined;

    metaBySlot.set(key, {
      _start: (row._start as string) ?? undefined,
      _stop: (row._stop as string) ?? undefined,
      _time: (row._time as string) ?? undefined,
      _measurement: (row._measurement as string) ?? undefined,
      area: (row.area as string) ?? undefined,
      profile: (row.profile as string) ?? undefined,
      side: (row.side as string) ?? undefined,
      ...(Number.isFinite(xPos) && xPos != null && { xPosition: xPos }),
      ...(Number.isFinite(yPos) && yPos != null && { yPosition: yPos }),
    });
  }

  const slots: PlantSlot[] = [];
  for (const [key, fieldValues] of bySlot.entries()) {
    const values: ParameterValue = {};
    for (const [fieldName, v] of Object.entries(fieldValues)) {
      if (v && typeof v.value === 'number') values[fieldName] = v.value;
    }
    const [chamberPart, devicePart, levelPart] = key.split('|');
    const meta = metaBySlot.get(key);
    const id = `live_${chamberPart}|${devicePart}|${levelPart}`.replace(
      /\s/g,
      '_',
    );
    slots.push({ id, rowIndex: 0, columnIndex: 0, values, meta });
  }

  return slots;
}

function chamberFromSlotId(slotId: string): string {
  const after = slotId.replace(/^live_/, '');
  return after.split('|')[0] ?? 'Chamber_01';
}

function buildBayFromSlots(
  slots: PlantSlot[],
  chamberName: string,
  bayIndex: number,
): Bay {
  const rows: Row[] = [];
  for (let ri = 0; ri < SENSOR_ROWS; ri++) {
    const columns: Column[] = [];
    for (let ci = 0; ci < SENSOR_COLS; ci++) {
      const slot = slots.find((s) => s.rowIndex === ri && s.columnIndex === ci);
      columns.push({
        id: `col-${bayIndex}-${ri}-${ci}`,
        index: ci,
        slots: slot ? [slot] : [],
      });
    }
    rows.push({ id: `row-${bayIndex}-${ri}`, index: ri, columns });
  }
  return {
    id: `bay-live-${bayIndex}`,
    name: chamberName,
    index: bayIndex,
    rows,
    batchId: null,
  };
}

export function influxRowsToBays(
  bucketDataRows: { data: Record<string, unknown> }[],
  sensorConfigs?: Map<string, SensorConfigOverride>,
): Bay[] {
  const rows: InfluxDBRow[] = bucketDataRows.map(
    (item) => item.data as InfluxDBRow,
  );
  const allSlots = buildSlotsFromRows(rows, sensorConfigs);

  const byChamber = new Map<string, PlantSlot[]>();
  for (const slot of allSlots) {
    const chamber = chamberFromSlotId(slot.id);
    const list = byChamber.get(chamber) ?? [];
    list.push(slot);
    byChamber.set(chamber, list);
  }

  if (byChamber.size === 0 && allSlots.length > 0) {
    byChamber.set('Chamber_01', allSlots.slice(0, GRID_SIZE));
  }

  return Array.from(byChamber.keys())
    .sort()
    .map((chamber, idx) => {
      const chamberSlots = byChamber.get(chamber) ?? [];
      const gridSlots = chamberSlots.slice(0, GRID_SIZE).map((s, i) => ({
        ...s,
        rowIndex: Math.floor(i / SENSOR_COLS),
        columnIndex: i % SENSOR_COLS,
      }));
      return buildBayFromSlots(gridSlots, chamber, idx);
    });
}
