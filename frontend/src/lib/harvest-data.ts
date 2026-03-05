import type { HarvestRecord, HarvestSummary } from '@/lib/types/harvest'
import type { BatchFormData } from '@/lib/types/batch'

const mockHarvestData: HarvestRecord[] = [
  {
    id: '1',
    date: '3/05/2026',
    batch: 'Strawberry - Elsanta',
    classA: 11.8,
    waste: 0.6,
    avgBrix: 7.1,
    photos: 0,
    createdAt: new Date('2026-03-05').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
  },
  {
    id: '2',
    date: '3/04/2026',
    batch: 'Tomato - Roma',
    classA: 12.9,
    waste: 0.7,
    avgBrix: 4.8,
    photos: 0,
    createdAt: new Date('2026-03-04').toISOString(),
    updatedAt: new Date('2026-03-04').toISOString(),
  },
  {
    id: '3',
    date: '3/03/2026',
    batch: 'Strawberry - Elsanta',
    classA: 14.3,
    waste: 0.9,
    avgBrix: 7.9,
    photos: 0,
    createdAt: new Date('2026-03-03').toISOString(),
    updatedAt: new Date('2026-03-03').toISOString(),
  },
  {
    id: '4',
    date: '3/02/2026',
    batch: 'Lettuce - Butterhead',
    classA: 14.1,
    waste: 0.5,
    avgBrix: 1.2,
    photos: 0,
    createdAt: new Date('2026-03-02').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
  },
  {
    id: '5',
    date: '3/01/2026',
    batch: 'Strawberry - Elsanta',
    classA: 10.8,
    waste: 0.7,
    avgBrix: 7.5,
    photos: 0,
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: '6',
    date: '2/28/2026',
    batch: 'Basil - Genovese',
    classA: 12.9,
    waste: 1.7,
    avgBrix: 2.1,
    photos: 0,
    createdAt: new Date('2026-02-28').toISOString(),
    updatedAt: new Date('2026-02-28').toISOString(),
  },
  {
    id: '7',
    date: '2/27/2026',
    batch: 'Tomato - Roma',
    classA: 11.0,
    waste: 0.8,
    avgBrix: 4.8,
    photos: 0,
    createdAt: new Date('2026-02-27').toISOString(),
    updatedAt: new Date('2026-02-27').toISOString(),
  },
  {
    id: '8',
    date: '2/26/2026',
    batch: 'Strawberry - Elsanta',
    classA: 10.3,
    waste: 0.7,
    avgBrix: 7.7,
    photos: 0,
    createdAt: new Date('2026-02-26').toISOString(),
    updatedAt: new Date('2026-02-26').toISOString(),
  },
  {
    id: '9',
    date: '2/25/2026',
    batch: 'Pepper - California',
    classA: 14.1,
    waste: 0.9,
    avgBrix: 3.2,
    photos: 0,
    createdAt: new Date('2026-02-25').toISOString(),
    updatedAt: new Date('2026-02-25').toISOString(),
  },
  {
    id: '10',
    date: '2/24/2026',
    batch: 'Strawberry - Elsanta',
    classA: 15.0,
    waste: 1.2,
    avgBrix: 7.3,
    photos: 0,
    createdAt: new Date('2026-02-24').toISOString(),
    updatedAt: new Date('2026-02-24').toISOString(),
  },
  {
    id: '11',
    date: '2/23/2026',
    batch: 'Lettuce - Butterhead',
    classA: 11.9,
    waste: 1.6,
    avgBrix: 1.5,
    photos: 0,
    createdAt: new Date('2026-02-23').toISOString(),
    updatedAt: new Date('2026-02-23').toISOString(),
  },
  {
    id: '12',
    date: '2/22/2026',
    batch: 'Tomato - Roma',
    classA: 12.1,
    waste: 1.0,
    avgBrix: 4.9,
    photos: 0,
    createdAt: new Date('2026-02-22').toISOString(),
    updatedAt: new Date('2026-02-22').toISOString(),
  },
  {
    id: '13',
    date: '2/21/2026',
    batch: 'Strawberry - Elsanta',
    classA: 14.3,
    waste: 1.6,
    avgBrix: 7.2,
    photos: 0,
    createdAt: new Date('2026-02-21').toISOString(),
    updatedAt: new Date('2026-02-21').toISOString(),
  },
  {
    id: '14',
    date: '2/20/2026',
    batch: 'Basil - Genovese',
    classA: 10.7,
    waste: 0.6,
    avgBrix: 2.3,
    photos: 0,
    createdAt: new Date('2026-02-20').toISOString(),
    updatedAt: new Date('2026-02-20').toISOString(),
  },
  {
    id: '15',
    date: '2/19/2026',
    batch: 'Strawberry - Elsanta',
    classA: 13.2,
    waste: 0.8,
    avgBrix: 6.9,
    photos: 0,
    createdAt: new Date('2026-02-19').toISOString(),
    updatedAt: new Date('2026-02-19').toISOString(),
  },
]

// Extended mock data for pagination testing
const extendedMockData: HarvestRecord[] = [
  {
    id: '16',
    date: '2/18/2026',
    batch: 'Pepper - California',
    classA: 11.5,
    waste: 0.4,
    avgBrix: 3.8,
    photos: 0,
    createdAt: new Date('2026-02-18').toISOString(),
    updatedAt: new Date('2026-02-18').toISOString(),
  },
  {
    id: '17',
    date: '2/17/2026',
    batch: 'Tomato - Roma',
    classA: 13.2,
    waste: 0.9,
    avgBrix: 4.7,
    photos: 0,
    createdAt: new Date('2026-02-17').toISOString(),
    updatedAt: new Date('2026-02-17').toISOString(),
  },
  {
    id: '18',
    date: '2/16/2026',
    batch: 'Lettuce - Butterhead',
    classA: 12.7,
    waste: 0.6,
    avgBrix: 1.4,
    photos: 0,
    createdAt: new Date('2026-02-16').toISOString(),
    updatedAt: new Date('2026-02-16').toISOString(),
  },
  {
    id: '19',
    date: '2/15/2026',
    batch: 'Strawberry - Sonata',
    classA: 10.4,
    waste: 1.1,
    avgBrix: 8.1,
    photos: 0,
    createdAt: new Date('2026-02-15').toISOString(),
    updatedAt: new Date('2026-02-15').toISOString(),
  },
  {
    id: '20',
    date: '2/14/2026',
    batch: 'Strawberry - Sonata',
    classA: 14.8,
    waste: 0.3,
    avgBrix: 8.3,
    photos: 0,
    createdAt: new Date('2026-02-14').toISOString(),
    updatedAt: new Date('2026-02-14').toISOString(),
  },
]

// Combine all harvest data
let allHarvestData = [...mockHarvestData, ...extendedMockData]

export function getAllHarvests(): HarvestRecord[] {
  // Sort by date (newest first)
  return allHarvestData.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function addNewHarvest(batchData: BatchFormData): HarvestRecord {
  const newId = (allHarvestData.length + 1).toString()
  const batchName = `${batchData.species} - ${batchData.variety}`
  
  // Generate realistic harvest data based on batch
  const classA = Math.round((8 + Math.random() * 8) * 10) / 10 // 8-16 kg
  const waste = Math.round((0.3 + Math.random() * 1.5) * 10) / 10 // 0.3-1.8 kg
  const avgBrix = Math.round((6.5 + Math.random() * 2) * 10) / 10 // 6.5-8.5°Bx
  
  const newHarvest: HarvestRecord = {
    id: newId,
    date: new Date().toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    batch: batchName,
    classA,
    waste,
    avgBrix,
    photos: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  allHarvestData.unshift(newHarvest) // Add to beginning
  return newHarvest
}

export function getHarvestSummary(): HarvestSummary {
  const harvests = getAllHarvests()
  const totalClassA = harvests.reduce((sum, harvest) => sum + harvest.classA, 0)
  const totalWaste = harvests.reduce((sum, harvest) => sum + harvest.waste, 0)
  const avgBrix = harvests.reduce((sum, harvest) => sum + harvest.avgBrix, 0) / harvests.length

  // Get the most common variety from the batch names
  const varieties = harvests.map(h => h.batch)
  const varietyCounts = varieties.reduce((acc, variety) => {
    acc[variety] = (acc[variety] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostCommonVariety = Object.entries(varietyCounts)
    .sort(([,a], [,b]) => b - a)[0][0] || 'Strawberry - Elsanta'

  return {
    totalHarvests: harvests.length,
    variety: mostCommonVariety,
    totalClassA: Math.round(totalClassA * 10) / 10,
    totalWaste: Math.round(totalWaste * 10) / 10,
    avgBrix: Math.round(avgBrix * 10) / 10,
  }
}