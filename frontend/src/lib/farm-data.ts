import type {
  Farm,
  Bay,
  Row,
  Column,
  PlantSlot,
  Batch,
  ParameterValue,
} from './farm-types'

// Generate random parameter values
function generateParameterValue(): ParameterValue {
  return {
    fruitLoad: 11 + Math.random() * 2, // 11 to 13 (marginal difference)
    canopyCover: 700 + Math.random() * 250, // 700 to 950 sq cm (bottom high top low)
    energyBalance: (Math.random() - 0.5) * 200, // -100 to 100
    temperature: 19 + Math.random() * 3, // 19-22°C
    humidity: 60 + Math.random() * 10, // 60 to 70% (high to low)
  }
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

// Get parameter value for a plant slot
export function getParameterValue(slot: PlantSlot, parameter: string): number {
  return slot.values[parameter as keyof ParameterValue] || 0
}

// Get color for a parameter value
export function getParameterColor(
  value: number,
  parameter: string,
  slotId?: string,
  verticalPosition?: number // 0 (top) to 1 (bottom) for temperature gradient
): string {
  switch (parameter) {
    case 'fruitLoad':
      // Marginal difference: 11-13 range (green scale)
      // Bottom high (13) = darker green, Top low (11) = lighter green
      const normalizedFruit =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = darker, top (0) = lighter
          : Math.max(0, Math.min(1, (value - 11) / 2)) // Fallback to value-based
      const green = Math.round(100 + normalizedFruit * 155)
      // Add tiny bit of noise for texture
      const fruitNoise = slotId
        ? ((slotId.charCodeAt(0) % 10) - 5) * 2
        : (((value * 100) % 10) - 5) * 2
      const finalGreen = Math.max(100, Math.min(255, green + fruitNoise))
      return `rgb(0, ${finalGreen}, 0)`
    case 'canopyCover':
      // Bottom high top low: 700-950 sq cm range (blue scale)
      // Bottom (high, 950) = darker blue, Top (low, 700) = lighter blue
      const normalizedCanopy =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = darker, top (0) = lighter
          : Math.max(0, Math.min(1, (value - 700) / 250)) // Fallback to value-based
      // For vertical position: bottom (1) = darker, top (0) = lighter
      // For value-based: higher values should be darker, so invert
      const invertedCanopy =
        verticalPosition !== undefined
          ? normalizedCanopy // Already correct: 1 = dark, 0 = light
          : 1 - normalizedCanopy // Invert for value-based
      const canopyBlue = Math.round(100 + invertedCanopy * 155)
      // Add tiny bit of noise for texture
      const canopyNoise = slotId
        ? ((slotId.charCodeAt(0) % 10) - 5) * 2
        : (((value * 100) % 10) - 5) * 2
      const finalBlue = Math.max(100, Math.min(255, canopyBlue + canopyNoise))
      return `rgb(0, 0, ${finalBlue})`
    case 'energyBalance': {
      // 80% blue (bottom), 20% green (top)
      // Use verticalPosition (0=top, 1=bottom) instead of energy balance value
      const energyPositionNormalized =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = blue, top (0) = green
          : Math.max(0, Math.min(1, (value + 100) / 200)) // Fallback to value-based

      let r_energy, g_energy, b_energy

      // Smooth gradient: Green at top (0-0.2) transitioning to Blue at bottom (0.2-1.0)
      // At position 0.0: Pure Green (0, 200, 0)
      // At position 0.2: Transition point (mix of green and blue)
      // At position 1.0: Pure Blue (0, 0, 200)

      if (energyPositionNormalized <= 0.2) {
        // Top 20%: Green transitioning to green-blue mix
        // Position 0.0 = 100% green, Position 0.2 = 50% green, 50% blue
        const greenRatio = 1 - (energyPositionNormalized / 0.2) * 0.5 // 1.0 to 0.5
        const blueRatio = (energyPositionNormalized / 0.2) * 0.5 // 0.0 to 0.5
        g_energy = Math.round(200 * greenRatio)
        b_energy = Math.round(200 * blueRatio)
        r_energy = 0
      } else {
        // Bottom 80%: Green-blue mix transitioning to pure blue
        // Position 0.2 = 50% green, 50% blue
        // Position 1.0 = 100% blue
        const transitionProgress = (energyPositionNormalized - 0.2) / 0.8 // 0.0 to 1.0
        const greenRatio = 0.5 * (1 - transitionProgress) // 0.5 to 0.0
        const blueRatio = 0.5 + 0.5 * transitionProgress // 0.5 to 1.0
        g_energy = Math.round(200 * greenRatio)
        b_energy = Math.round(200 * blueRatio)
        r_energy = 0
      }

      // Add tiny bit of deterministic noise for subtle texture
      let energyNoise = 0
      if (slotId) {
        let hash = 0
        for (let i = 0; i < slotId.length; i++) {
          hash = (hash << 5) - hash + slotId.charCodeAt(i)
          hash = hash | 0
        }
        const valueHash = (value * 100) % 100
        energyNoise =
          (Math.sin(hash * 0.01) +
            Math.cos(hash * 0.007) +
            Math.sin(valueHash)) *
          3
      } else {
        const hash = (value * 1000) % 1000
        energyNoise = (Math.sin(hash * 0.1) + Math.cos(hash * 0.07)) * 3
      }

      g_energy = Math.max(0, Math.min(255, g_energy + energyNoise))
      b_energy = Math.max(0, Math.min(255, b_energy + energyNoise))

      return `rgb(${Math.round(r_energy)}, ${Math.round(
        g_energy
      )}, ${Math.round(b_energy)})`
    }
    case 'temperature':
      // Gradient from bottom (blue) to top (red) based on vertical position
      // Bottom = Blue (19°C), Top = Red (22°C), with green in between
      // Use verticalPosition (0=top, 1=bottom) instead of temperature value
      const positionNormalized =
        verticalPosition !== undefined
          ? verticalPosition // bottom (1) = blue, top (0) = red
          : Math.max(0, Math.min(1, (value - 19) / 3)) // Fallback to value-based
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
    default:
      return '#cccccc'
  }
}

// Normalize parameter value to 0-100 range for color mapping
export function normalizeParameterValue(
  value: number,
  parameter: string
): number {
  switch (parameter) {
    case 'energyBalance':
      return (value + 100) / 2 // -100 to 100 -> 0 to 100
    case 'temperature':
      return ((value - 19) / 3) * 100 // 19-22°C -> 0-100
    case 'humidity':
      return value // Already 0-100
    case 'fruitLoad':
      return (value / 13) * 100 // 0-13 -> 0-100
    case 'canopyCover':
      return (value / 1000) * 100 // 0-1000 -> 0-100
    default:
      return value
  }
}
