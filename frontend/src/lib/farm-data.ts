import type {
  Farm,
  Bay,
  Row,
  Column,
  PlantSlot,
  Batch,
  ParameterValue,
} from '@/types/farm.types';

// =============================================================================
// FARM STRUCTURE GENERATION (for development/testing)
// =============================================================================

// Generate random parameter values (fallback when no live data) - empty; real data comes from bucket
function generateParameterValue(): ParameterValue {
  return {};
}

// Generate a plant slot
function generatePlantSlot(
  rowIndex: number,
  columnIndex: number,
  slotIndex: number,
): PlantSlot {
  return {
    id: `slot-${rowIndex}-${columnIndex}-${slotIndex}`,
    rowIndex,
    columnIndex,
    values: generateParameterValue(),
  };
}

// Generate a column with plant slots
function generateColumn(
  rowIndex: number,
  columnIndex: number,
  slotsPerColumn: number = 10,
): Column {
  const slots: PlantSlot[] = [];
  for (let i = 0; i < slotsPerColumn; i++) {
    slots.push(generatePlantSlot(rowIndex, columnIndex, i));
  }
  return {
    id: `column-${rowIndex}-${columnIndex}`,
    index: columnIndex,
    slots,
  };
}

// Generate a row with columns
function generateRow(
  bayIndex: number,
  rowIndex: number,
  columnsPerRow: number = 12,
): Row {
  const columns: Column[] = [];
  for (let i = 0; i < columnsPerRow; i++) {
    columns.push(generateColumn(rowIndex, i));
  }
  return {
    id: `row-${bayIndex}-${rowIndex}`,
    index: rowIndex,
    columns,
  };
}

// Generate a bay with rows
function generateBay(bayIndex: number, rowsPerBay: number = 70): Bay {
  const rows: Row[] = [];
  for (let i = 0; i < rowsPerBay; i++) {
    rows.push(generateRow(bayIndex, i));
  }
  return {
    id: `bay-${bayIndex}`,
    name: `Bay ${String(bayIndex + 1).padStart(2, '0')}`,
    index: bayIndex,
    rows,
    batchId: null,
  };
}

// Generate batches
function generateBatches(): Batch[] {
  const batches: Batch[] = [];
  const crops = ['HS03004', 'HSC', 'HS03005', 'HS03006'];
  const varieties = ['favori', 'karima', 'limore', 'florice'];
  const statuses: Array<'onTime' | 'delayed' | 'early'> = [
    'onTime',
    'onTime',
    'delayed',
    'early',
  ];

  for (let i = 0; i < 4; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - i * 14); // Stagger start dates
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 90); // 90-day cycle

    batches.push({
      id: `batch-${String(i + 1).padStart(3, '0')}`,
      name: `Batch-${String(i + 1).padStart(3, '0')}`,
      cropName: crops[i] || `Crop ${i + 1}`,
      varietyId: varieties[i], // One batch per variety
      status: statuses[i] || 'onTime',
      progress: 20 + i * 15 + Math.random() * 10, // 20-95%
      startDate,
      endDate,
      bayIds: [`bay-${i * 2}`, `bay-${i * 2 + 1}`], // Each batch uses 2 bays
    });
  }

  return batches;
}

// Generate the complete farm structure
export function generateFarm(): Farm {
  const bays: Bay[] = [];
  const numBays = 8;

  // Generate 8 bays (4 batches × 2 bays each)
  for (let i = 0; i < numBays; i++) {
    bays.push(generateBay(i));
  }

  // Generate batches
  const batches = generateBatches();

  // Assign batches to bays
  batches.forEach((batch) => {
    batch.bayIds.forEach((bayId) => {
      const bay = bays.find((b) => b.id === bayId);
      if (bay) {
        bay.batchId = batch.id;
      }
    });
  });

  return {
    bays,
    batches,
  };
}

// =============================================================================
// DATA UTILITIES
// =============================================================================

// Get parameter value for a plant slot (parameter = _field name from bucket)
export function getParameterValue(slot: PlantSlot, parameter: string): number {
  return slot.values[parameter] ?? 0;
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/** Format numeric value for display (e.g. 6812 → 6.8k). */
export function formatParameterDisplayValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const k = value / 1000;
    const decimals = abs >= 10000 ? 0 : 1;
    return `${k.toFixed(decimals)}k`;
  }
  return value.toFixed(1);
}

/** Unit string for a parameter (e.g. temperature → °C, co2 → ppm) */
export function getParameterUnit(parameter: string): string {
  const units: Record<string, string> = {
    temperature: '°C',
    soil_temp: '°C',
    co2: 'ppm',
    humidity: '%',
    soil_moisture: '%',
    vpd: 'kPa',
    par: 'µmol/m²/s',
    par_estimated: 'µmol/m²/s',
    soil_conductivity: 'mS/cm',
    soilEC: 'mS/cm',
    battery_v: 'V',
    voltage_v: 'V',
    current_ma: 'mA',
    lux: 'lux',
    pressure_mpa: 'MPa',
    rssi: 'dBm',
    snr: 'dB',
  };
  return units[parameter] ?? '';
}

/** Format Influx _field name to display label (e.g. soil_conductivity -> Soil conductivity) */
export function formatFieldToLabel(field: string): string {
  const known: Record<string, string> = {
    battery_v: 'Battery (V)',
    co2: 'CO₂',
    current_ma: 'Current (mA)',
    humidity: 'Humidity',
    lux: 'Lux',
    vpd: 'VPD',
    par: 'PAR',
    par_estimated: 'PAR',
    pressure_mpa: 'Pressure (MPa)',
    soil_conductivity: 'Soil EC',
    soil_moisture: 'Soil moisture',
    soil_temp: 'Soil temp',
    temperature: 'Temperature',
    voltage_v: 'Voltage (V)',
    rssi: 'RSSI',
    snr: 'SNR',
  };
  if (known[field]) return known[field];
  return field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// =============================================================================
// COLOR UTILITIES
// =============================================================================

// Get color for a parameter value using HSV gradient with texture noise
function valueToGradient(
  value: number,
  min: number,
  max: number,
  slotId?: string,
): string {
  const n = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const hue = (1 - n) * 240; // blue (low) to red (high) - matches legend gradient
  const c = 1;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 1 - c;
  let r = 0,
    g = 0,
    b = 0;

  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else {
    r = 0;
    g = x;
    b = c;
  }

  // Add deterministic noise for texture
  const noise = slotId ? ((slotId.charCodeAt(0) % 10) - 5) * 2 : 0;
  r = Math.round((r + m) * 255) + noise;
  g = Math.round((g + m) * 255) + noise;
  b = Math.round((b + m) * 255) + noise;

  return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
}

// Get color for parameter value - maps to the color legend gradient
export function getParameterColor(
  value: number,
  parameter: string,
  slotId?: string,
): string {
  switch (parameter) {
    case 'temperature':
    case 'soil_temp':
      return valueToGradient(value, 15, 30, slotId);
    case 'humidity':
    case 'soil_moisture':
      return valueToGradient(value, 0, 100, slotId);
    case 'co2':
      return valueToGradient(value, 400, 1200, slotId);
    case 'vpd':
      return valueToGradient(value, 0, 2, slotId);
    case 'par':
    case 'par_estimated':
      return valueToGradient(value, 0, 1000, slotId);
    case 'soilEC':
    case 'soil_conductivity':
      return valueToGradient(value, 0, 3, slotId);
    case 'battery_v':
    case 'voltage_v':
      return valueToGradient(value, 0, 5, slotId);
    case 'current_ma':
      return valueToGradient(value, 0, 500, slotId);
    case 'lux':
      return valueToGradient(value, 0, 10000, slotId);
    case 'pressure_mpa':
      return valueToGradient(value, 0, 0.5, slotId);
    case 'rssi':
    case 'snr':
      return valueToGradient(value, -120, 0, slotId);
    default:
      return valueToGradient(value, 0, 100, slotId);
  }
}

// =============================================================================
// NORMALIZATION & HEATMAP UTILITIES
// =============================================================================

// Normalize parameter value to 0-100 range for color mapping (supports dynamic _field names)
export function normalizeParameterValue(
  value: number,
  parameter: string,
): number {
  switch (parameter) {
    case 'temperature':
    case 'soil_temp':
      return ((value - 15) / 15) * 100;
    case 'humidity':
    case 'soil_moisture':
      return Math.max(0, Math.min(100, value));
    case 'co2':
      return (value / 1200) * 100;
    case 'vpd':
      return (value / 2) * 100;
    case 'par':
    case 'par_estimated':
      return (value / 1000) * 100;
    case 'soil_conductivity':
    case 'soilEC':
      return (value / 3) * 100;
    case 'battery_v':
    case 'voltage_v':
      return (value / 5) * 100;
    case 'lux':
      return (value / 10000) * 100;
    case 'rssi':
    case 'snr':
      return ((value + 120) / 120) * 100;
    default:
      return Math.max(0, Math.min(100, value));
  }
}

/**
 * Multicolor colormap for heatmap: blue (low) → red (high), matching the top legend bar.
 * value in [minV, maxV].
 */
export function valueToHotColor(
  value: number,
  minV: number,
  maxV: number,
): string {
  const n = Math.max(0, Math.min(1, (value - minV) / (maxV - minV || 1)));

  const stops = [
    { t: 0, r: 0, g: 0, b: 255 }, // blue
    { t: 0.2, r: 0, g: 255, b: 255 }, // cyan
    { t: 0.4, r: 0, g: 255, b: 0 }, // green
    { t: 0.6, r: 255, g: 255, b: 0 }, // yellow
    { t: 0.8, r: 255, g: 127, b: 0 }, // orange
    { t: 1, r: 255, g: 0, b: 0 }, // red
  ];

  let start = stops[0];
  let end = stops[stops.length - 1];

  for (let i = 1; i < stops.length; i++) {
    if (n <= stops[i].t) {
      start = stops[i - 1];
      end = stops[i];
      break;
    }
  }

  const span = end.t - start.t || 1;
  const localT = (n - start.t) / span;

  const r = Math.round(start.r + (end.r - start.r) * localT);
  const g = Math.round(start.g + (end.g - start.g) * localT);
  const b = Math.round(start.b + (end.b - start.b) * localT);

  return `rgb(${r}, ${g}, ${b})`;
}
