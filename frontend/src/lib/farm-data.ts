import type {
  Farm,
  Bay,
  Row,
  Column,
  PlantSlot,
  Batch,
  ParameterValue,
} from './farm-types'

// Generate random parameter values (fallback when no live data) - empty; real data comes from bucket
function generateParameterValue(): ParameterValue {
  return {}
}

// Generate a plant slot
function generatePlantSlot(
  rowIndex: number,
  columnIndex: number,
  slotIndex: number
): PlantSlot {
  return {
    id: `slot-${rowIndex}-${columnIndex}-${slotIndex}`,
    rowIndex,
    columnIndex,
    values: generateParameterValue(),
  }
}

// Generate a column with plant slots
function generateColumn(
  rowIndex: number,
  columnIndex: number,
  slotsPerColumn: number = 10
): Column {
  const slots: PlantSlot[] = []
  for (let i = 0; i < slotsPerColumn; i++) {
    slots.push(generatePlantSlot(rowIndex, columnIndex, i))
  }
  return {
    id: `column-${rowIndex}-${columnIndex}`,
    index: columnIndex,
    slots,
  }
}

// Generate a row with columns
function generateRow(
  bayIndex: number,
  rowIndex: number,
  columnsPerRow: number = 12
): Row {
  const columns: Column[] = []
  for (let i = 0; i < columnsPerRow; i++) {
    columns.push(generateColumn(rowIndex, i))
  }
  return {
    id: `row-${bayIndex}-${rowIndex}`,
    index: rowIndex,
    columns,
  }
}

// Generate a bay with rows
function generateBay(bayIndex: number, rowsPerBay: number = 70): Bay {
  const rows: Row[] = []
  for (let i = 0; i < rowsPerBay; i++) {
    rows.push(generateRow(bayIndex, i))
  }
  return {
    id: `bay-${bayIndex}`,
    name: `Bay ${String(bayIndex + 1).padStart(2, '0')}`,
    index: bayIndex,
    rows,
    batchId: null,
  }
}

// Generate batches
function generateBatches(): Batch[] {
  const batches: Batch[] = []
  const crops = ['HS03004', 'HSC', 'HS03005', 'HS03006']
  const varieties = ['favori', 'karima', 'limore', 'florice']
  const statuses: Array<'onTime' | 'delayed' | 'early'> = [
    'onTime',
    'onTime',
    'delayed',
    'early',
  ]

  for (let i = 0; i < 4; i++) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - i * 14) // Stagger start dates
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 90) // 90-day cycle

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
    })
  }

  return batches
}

// Generate the complete farm structure
export function generateFarm(): Farm {
  const bays: Bay[] = []
  const numBays = 8

  // Generate 8 bays (4 batches × 2 bays each)
  for (let i = 0; i < numBays; i++) {
    bays.push(generateBay(i))
  }

  // Generate batches
  const batches = generateBatches()

  // Assign batches to bays
  batches.forEach((batch) => {
    batch.bayIds.forEach((bayId) => {
      const bay = bays.find((b) => b.id === bayId)
      if (bay) {
        bay.batchId = batch.id
      }
    })
  })

  return {
    bays,
    batches,
  }
}

// Get parameter value for a plant slot (parameter = _field name from bucket)
export function getParameterValue(slot: PlantSlot, parameter: string): number {
  return slot.values[parameter] ?? 0
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
  }
  return units[parameter] ?? ''
}

// Get color for a parameter value (0–1 normalized for gradient)
function valueToGradient(
  value: number,
  min: number,
  max: number,
  slotId?: string
): string {
  const n = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  const hue = (1 - n) * 240 // blue (low) to red (high)
  const c = 1
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = 1 - c
  let r = 0,
    g = 0,
    b = 0
  if (hue >= 0 && hue < 60) {
    r = c
    g = x
    b = 0
  } else if (hue >= 60 && hue < 120) {
    r = x
    g = c
    b = 0
  } else if (hue >= 120 && hue < 180) {
    r = 0
    g = c
    b = x
  } else {
    r = 0
    g = x
    b = c
  }
  const noise = slotId ? ((slotId.charCodeAt(0) % 10) - 5) * 2 : 0
  r = Math.round((r + m) * 255) + noise
  g = Math.round((g + m) * 255) + noise
  b = Math.round((b + m) * 255) + noise
  return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`
}

// Get color for a parameter value
export function getParameterColor(
  value: number,
  parameter: string,
  slotId?: string,
  verticalPosition?: number
): string {
  switch (parameter) {
    case 'temperature':
      // Legend: 15°C = blue (cold), 30°C = red (hot). Value-based gradient.
      const positionNormalized =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = blue, top (0) = red
          : Math.max(0, Math.min(1, (30 - value) / 15)) // 15°C→1 (blue), 30°C→0 (red)
      let r, g, b

      // Smooth continuous gradient through the full spectrum
      // Blue (240°) -> Cyan (180°) -> Green (120°) -> Yellow (60°) -> Red (0°)
      // Bottom (positionNormalized = 1) = Blue, Top (0) = Red
      const hue = positionNormalized * 240 // 240° (blue at bottom) to 0° (red at top)
      const saturation = 1.0
      const v = 1.0 // HSV value (brightness)

      // Convert HSV to RGB
      const c = v * saturation
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
      const m = v - c

      let r_temp, g_temp, b_temp
      if (hue >= 0 && hue < 60) {
        // Red to Yellow (0° to 60°)
        r_temp = c
        g_temp = x
        b_temp = 0
      } else if (hue >= 60 && hue < 120) {
        // Yellow to Green (60° to 120°)
        r_temp = x
        g_temp = c
        b_temp = 0
      } else if (hue >= 120 && hue < 180) {
        // Green to Cyan (120° to 180°)
        r_temp = 0
        g_temp = c
        b_temp = x
      } else {
        // Cyan to Blue (180° to 240°)
        r_temp = 0
        g_temp = x
        b_temp = c
      }

      // Convert to 0-255 range
      r = Math.round((r_temp + m) * 255)
      g = Math.round((g_temp + m) * 255)
      b = Math.round((b_temp + m) * 255)

      // Add tiny bit of deterministic noise for subtle texture (based on value for variation)
      // Use slotId for consistent noise per slot, or value-based hash as fallback
      let noise = 0
      if (slotId) {
        // Create hash from slotId for consistent noise
        let hash = 0
        for (let i = 0; i < slotId.length; i++) {
          hash = (hash << 5) - hash + slotId.charCodeAt(i)
          hash = hash | 0 // Convert to 32-bit integer
        }
        // Add value-based variation for noise
        const valueHash = (value * 100) % 100
        noise =
          (Math.sin(hash * 0.01) +
            Math.cos(hash * 0.007) +
            Math.sin(valueHash)) *
          3
      } else {
        // Fallback to value-based noise
        const hash = (value * 1000) % 1000
        noise = (Math.sin(hash * 0.1) + Math.cos(hash * 0.07)) * 3
      }
      r = Math.max(0, Math.min(255, r + noise))
      g = Math.max(0, Math.min(255, g + noise))
      b = Math.max(0, Math.min(255, b + noise))
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    case 'humidity':
      // High to low: 70% to 60% (higher = one color, lower = another)
      // Bottom (high, 70%) = darker cyan, Top (low, 60%) = lighter cyan
      const normalizedHumidity =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = darker, top (0) = lighter
          : Math.max(0, Math.min(1, (value - 60) / 10)) // Fallback to value-based
      // For vertical position: bottom (1) = darker, top (0) = lighter
      // For value-based: higher values should be darker, so invert
      const invertedHumidity =
        verticalPosition !== undefined
          ? normalizedHumidity // Already correct: 1 = dark, 0 = light
          : 1 - normalizedHumidity // Invert for value-based
      const cyan = Math.round(100 + invertedHumidity * 155)
      // Add tiny bit of noise for texture
      const humidityNoise = slotId
        ? ((slotId.charCodeAt(0) % 10) - 5) * 2
        : (((value * 100) % 10) - 5) * 2
      const finalCyan = Math.max(100, Math.min(255, cyan + humidityNoise))
      return `rgb(0, ${finalCyan}, ${finalCyan})`
    case 'co2':
      return valueToGradient(value, 400, 1200, slotId)
    case 'vpd':
      return valueToGradient(value, 0, 2, slotId)
    case 'par':
      return valueToGradient(value, 0, 1000, slotId)
    case 'soilMoisture':
      return valueToGradient(value, 0, 100, slotId)
    case 'soilEC':
    case 'soil_conductivity':
      return valueToGradient(value, 0, 3, slotId)
    case 'par_estimated':
      return valueToGradient(value, 0, 1000, slotId)
    case 'soil_temp':
      return valueToGradient(value, 15, 30, slotId)
    case 'soil_moisture':
      return valueToGradient(value, 0, 100, slotId)
    case 'battery_v':
    case 'voltage_v':
      return valueToGradient(value, 0, 5, slotId)
    case 'current_ma':
      return valueToGradient(value, 0, 500, slotId)
    case 'lux':
      return valueToGradient(value, 0, 10000, slotId)
    case 'pressure_mpa':
      return valueToGradient(value, 0, 0.5, slotId)
    case 'rssi':
    case 'snr':
      return valueToGradient(value, -120, 0, slotId)
    default:
      // Generic gradient for any other _field from bucket
      return valueToGradient(value, 0, 100, slotId)
  }
}

// Normalize parameter value to 0-100 range for color mapping (supports dynamic _field names)
export function normalizeParameterValue(
  value: number,
  parameter: string
): number {
  switch (parameter) {
    case 'temperature':
    case 'soil_temp':
      return ((value - 15) / 15) * 100
    case 'humidity':
    case 'soil_moisture':
      return Math.max(0, Math.min(100, value))
    case 'co2':
      return (value / 1200) * 100
    case 'vpd':
      return (value / 2) * 100
    case 'par':
    case 'par_estimated':
      return (value / 1000) * 100
    case 'soil_conductivity':
    case 'soilEC':
      return (value / 3) * 100
    case 'battery_v':
    case 'voltage_v':
      return (value / 5) * 100
    case 'lux':
      return (value / 10000) * 100
    case 'rssi':
    case 'snr':
      return ((value + 120) / 120) * 100
    default:
      return Math.max(0, Math.min(100, value))
  }
}

/** Format Influx _field name to display label (e.g. soil_conductivity -> Soil conductivity) */
export function formatFieldToLabel(field: string): string {
  const known: Record<string, string> = {
    battery_v: 'Battery (V)',
    co2: 'CO₂',
    current_ma: 'Current (mA)',
    exti_pin: 'EXTI pin',
    exti_status: 'EXTI status',
    humidity: 'Humidity',
    in1_pin: 'In 1 pin',
    in2_pin: 'In 2 pin',
    lux: 'Lux',
    par_estimated: 'PAR (estimated)',
    pressure_mpa: 'Pressure (MPa)',
    probe_type: 'Probe type',
    soil_conductivity: 'Soil EC',
    soil_moisture: 'Soil moisture',
    soil_temp: 'Soil temp',
    temperature: 'Temperature',
    voltage_v: 'Voltage (V)',
    rssi: 'RSSI',
    snr: 'SNR',
  }
  if (known[field]) return known[field]
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
