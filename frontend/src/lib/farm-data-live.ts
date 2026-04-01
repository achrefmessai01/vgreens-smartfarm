import type {
  Bay,
  PlantSlot,
  ParameterValue,
  Row,
  Column,
} from '@/types/farm.types';

/**
 * PostgreSQL SensorConfig override values for a single device.
 * When present, these values take precedence over the InfluxDB tag values.
 */
export interface SensorConfigOverride {
  bay?: string | null;
  pole?: string | null;
  row?: string | null;
  greenhouse?: string | null;
  city?: string | null;
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
  /** Bay number (1–13). Used for dynamic map positioning. */
  bay?: string | number;
  /** Pole = row (vertical position). Used for dynamic map positioning. */
  pole?: string | number;
  /** Row = column (horizontal position within bay). Used for dynamic map positioning. */
  row?: string | number;
};

const SENSOR_COLS = 4;
const SENSOR_ROWS = 8;
const GRID_SIZE = SENSOR_COLS * SENSOR_ROWS;

/**
 * Group InfluxDB rows by sensor position (chamber + device + level).
 * For each position, take latest value per _field (any field from bucket) and build ParameterValue (Record<string, number>).
 */
function toNum(v: string | null | undefined): number | undefined {
  if (v == null || v === '') return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

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
    /** Bay number (1–13) for dynamic map positioning */
    bay?: number;
    /** Pole = row (vertical) for dynamic map positioning */
    pole?: number;
    /** Row = column within bay for dynamic map positioning */
    row?: number;
  };

  const bySlot = new Map<SlotKey, FieldValues>();
  const metaBySlot = new Map<SlotKey, SlotMeta>();

  for (const row of rows) {
    const influxGreenhouse =
      (row.greenhouse as string) ?? (row.chamber as string) ?? '';
    const device = (row.device as string) ?? '';
    const config = device ? sensorConfigs?.get(device) : undefined;
    // Use PostgreSQL greenhouse override if present, else InfluxDB value
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

    // Store latest metadata for this slot (independent of field)
    const rawBay = row.bay;
    const rawPole = row.pole;
    const rawRow = row.row;
    const influxBayNum =
      typeof rawBay === 'number'
        ? rawBay
        : typeof rawBay === 'string'
          ? parseInt(rawBay, 10)
          : undefined;
    const influxPoleNum =
      typeof rawPole === 'number'
        ? rawPole
        : typeof rawPole === 'string'
          ? parseInt(rawPole, 10)
          : undefined;
    const influxRowNum =
      typeof rawRow === 'number'
        ? rawRow
        : typeof rawRow === 'string'
          ? parseInt(rawRow, 10)
          : undefined;

    // Apply PostgreSQL SensorConfig overrides: config values take priority over InfluxDB tags
    const bayNum = toNum(config?.bay) ?? influxBayNum;
    const poleNum = toNum(config?.pole) ?? influxPoleNum;
    const rowNum = toNum(config?.row) ?? influxRowNum;

    metaBySlot.set(key, {
      _start: (row._start as string) ?? undefined,
      _stop: (row._stop as string) ?? undefined,
      _time: (row._time as string) ?? undefined,
      _measurement: (row._measurement as string) ?? undefined,
      area: (row.area as string) ?? undefined,
      profile: (row.profile as string) ?? undefined,
      side: (row.side as string) ?? undefined,
      ...(Number.isFinite(bayNum) && { bay: bayNum }),
      ...(Number.isFinite(poleNum) && { pole: poleNum }),
      ...(Number.isFinite(rowNum) && { row: rowNum }),
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
    // id encodes chamber|device|level so chamber = id.split('|')[0].replace('live_','')
    const id = `live_${chamberPart}|${devicePart}|${levelPart}`.replace(
      /\s/g,
      '_',
    );
    slots.push({
      id,
      rowIndex: 0,
      columnIndex: 0,
      values,
      meta,
    });
  }

  return slots;
}

/** Extract chamber name from slot id (format live_Chamber_01|device|level) */
function chamberFromSlotId(slotId: string): string {
  const after = slotId.replace(/^live_/, '');
  const first = after.split('|')[0];
  return first ?? 'Chamber_01';
}

/**
 * Build a single Bay from live slots for a given chamber (e.g. Chamber_01).
 * Fills a 4x8 grid; slots beyond GRID_SIZE are dropped.
 */
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
    rows.push({
      id: `row-${bayIndex}-${ri}`,
      index: ri,
      columns,
    });
  }

  return {
    id: `bay-live-${bayIndex}`,
    name: chamberName,
    index: bayIndex,
    rows,
    batchId: null,
  };
}

/**
 * Convert getBucketData response rows into Bays keyed by chamber.
 * Each chamber (Chamber_01, Chamber_02, ...) becomes one Bay with a 4x8 grid of slots.
 */
export function influxRowsToBays(
  bucketDataRows: { data: Record<string, unknown> }[],
  sensorConfigs?: Map<string, SensorConfigOverride>,
): Bay[] {
  const rows: InfluxDBRow[] = bucketDataRows.map(
    (item) => item.data as InfluxDBRow,
  );
  const allSlots = buildSlotsFromRows(rows, sensorConfigs);

  // Group by chamber (from slot id: live_Chamber_01|device|level)
  const byChamber = new Map<string, PlantSlot[]>();
  for (const slot of allSlots) {
    const chamber = chamberFromSlotId(slot.id);
    const list = byChamber.get(chamber) ?? [];
    list.push(slot);
    byChamber.set(chamber, list);
  }

  // If no chamber info, put all in one bay
  if (byChamber.size === 0 && allSlots.length > 0) {
    byChamber.set('Chamber_01', allSlots.slice(0, GRID_SIZE));
  }

  const chamberOrder = Array.from(byChamber.keys()).sort();
  const bays: Bay[] = chamberOrder.map((chamber, idx) => {
    const chamberSlots = byChamber.get(chamber) ?? [];
    // Re-assign row/col so we fill 4x8 grid
    const gridSlots: PlantSlot[] = chamberSlots
      .slice(0, GRID_SIZE)
      .map((s, i) => ({
        ...s,
        rowIndex: Math.floor(i / SENSOR_COLS),
        columnIndex: i % SENSOR_COLS,
      }));
    return buildBayFromSlots(gridSlots, chamber, idx);
  });

  return bays;
}
