export interface Variety {
  id: string
  name: string
  yield: number // in kg
  shelfLife: number // 1-5 stars
  taste: number // 1-5 stars
  diseaseResistance: number // 1-5 stars
  plantCycle: number // in months
  baseYieldMultiplier: number // Multiplier for yield calculations
  brixBase: number // Base Brix value for this variety
}

export const varieties: Variety[] = [
  {
    id: 'favori',
    name: 'Favori',
    yield: 1.2,
    shelfLife: 3.0,
    taste: 5.0,
    diseaseResistance: 4.0,
    plantCycle: 7,
    baseYieldMultiplier: 1.0,
    brixBase: 9.5,
  },
  {
    id: 'karima',
    name: 'Karima',
    yield: 2.6,
    shelfLife: 4.0,
    taste: 3.0,
    diseaseResistance: 3.0,
    plantCycle: 12,
    baseYieldMultiplier: 1.05,
    brixBase: 9.6,
  },
  {
    id: 'limore',
    name: 'Limore',
    yield: 3.4,
    shelfLife: 4.0,
    taste: 3.0,
    diseaseResistance: 3.0,
    plantCycle: 12,
    baseYieldMultiplier: 1.15,
    brixBase: 9.7,
  },
  {
    id: 'florice',
    name: 'Florice',
    yield: 2.5,
    shelfLife: 4.0,
    taste: 4.0,
    diseaseResistance: 4.0,
    plantCycle: 10,
    baseYieldMultiplier: 1.2,
    brixBase: 9.8,
  },
]

export function getVarietyById(id: string): Variety | undefined {
  return varieties.find((v) => v.id === id)
}

export function getDefaultVariety(): Variety {
  return varieties[0] // Favori
}
