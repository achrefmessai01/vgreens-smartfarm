import type { HarvestRecord, HarvestSummary } from '@/types/harvest.types';
import type { BatchFormData } from '@/types/batch.types';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';

const mockHarvestData: HarvestRecord[] = [
  {
    id: '1',
    date: '3/05/2026',
    batch: 'Strawberry - Elsanta',
    classA: 11.8,
    classB: 0,
    classC: 0,
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
    classB: 0,
    classC: 0,
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
    classB: 0,
    classC: 0,
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
    classB: 0,
    classC: 0,
    waste: 0.5,
    avgBrix: 1.2,
    photos: 0,
    createdAt: new Date('2026-03-02').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
  },
  {
    id: '5',
    date: '3/01/2026',
    batch: 'Basil - Genovese',
    classA: 13.2,
    classB: 0,
    classC: 0,
    waste: 0.8,
    avgBrix: 2.1,
    photos: 0,
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: '6',
    date: '2/29/2026',
    batch: 'Strawberry - Sonata',
    classA: 15.6,
    classB: 0,
    classC: 0,
    waste: 1.1,
    avgBrix: 8.3,
    photos: 0,
    createdAt: new Date('2026-02-29').toISOString(),
    updatedAt: new Date('2026-02-29').toISOString(),
  },
];

const allHarvestData: HarvestRecord[] = [...mockHarvestData];

export function getAllHarvests(): HarvestRecord[] {
  return [...allHarvestData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addNewHarvest(batchData: BatchFormData): HarvestRecord {
  const newId = (allHarvestData.length + 1).toString();
  // crop/variety are FK ids on the form now; the human-readable name is built
  // server-side, so this mock helper just joins the ids.
  const batchName = [batchData.cropId, batchData.varietyId]
    .filter(Boolean)
    .join(' - ');

  // Generate realistic harvest data based on batch
  const classA = Math.round((8 + Math.random() * 8) * 10) / 10; // 8-16 kg
  const waste = Math.round((0.3 + Math.random() * 1.5) * 10) / 10; // 0.3-1.8 kg
  const avgBrix = Math.round((6.5 + Math.random() * 2) * 10) / 10; // 6.5-8.5°Bx

  const newHarvest: HarvestRecord = {
    id: newId,
    date: new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }),
    batch: batchName,
    classA,
    classB: 0,
    classC: 0,
    waste,
    avgBrix,
    photos: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allHarvestData.unshift(newHarvest); // Add to beginning
  return newHarvest;
}

export function addCompletedBatchToHistory(
  batchData: BatchDetailsData,
): HarvestRecord {
  const newId = (allHarvestData.length + 1).toString();
  const batchName = `${batchData.species} - ${batchData.variety}`;

  const brixValues = batchData.entries
    .flatMap((entry) => entry.brixReadings)
    .filter((value) => value > 0);

  const avgBrix =
    brixValues.length > 0
      ? Math.round(
          (brixValues.reduce((sum, val) => sum + val, 0) / brixValues.length) *
            10,
        ) / 10
      : 0;

  const newHarvest: HarvestRecord = {
    id: newId,
    date: new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }),
    batch: batchName,
    classA: batchData.entries.reduce((sum, e) => sum + e.marketable, 0),
    classB: batchData.entries.reduce((sum, e) => sum + e.classB, 0),
    classC: batchData.entries.reduce((sum, e) => sum + e.classC, 0),
    waste: batchData.entries.reduce((sum, e) => sum + e.waste, 0),
    avgBrix,
    photos: batchData.photos.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  allHarvestData.unshift(newHarvest); // Add to beginning
  return newHarvest;
}

export function getHarvestSummary(): HarvestSummary {
  const harvests = getAllHarvests();
  const totalClassA = harvests.reduce(
    (sum, harvest) => sum + harvest.classA,
    0,
  );
  const totalClassB = harvests.reduce(
    (sum, harvest) => sum + harvest.classB,
    0,
  );
  const totalClassC = harvests.reduce(
    (sum, harvest) => sum + harvest.classC,
    0,
  );
  const totalWaste = harvests.reduce((sum, harvest) => sum + harvest.waste, 0);
  const avgBrix =
    harvests.reduce((sum, harvest) => sum + harvest.avgBrix, 0) /
    harvests.length;

  // Get the most common variety from the batch names
  const varieties = harvests.map((h) => h.batch);
  const varietyCounts = varieties.reduce(
    (acc, variety) => {
      acc[variety] = (acc[variety] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostCommonVariety =
    Object.entries(varietyCounts).sort(([, a], [, b]) => b - a)[0][0] ||
    'Strawberry - Elsanta';

  return {
    totalHarvests: harvests.length,
    variety: mostCommonVariety,
    totalClassA: Math.round(totalClassA * 10) / 10,
    totalClassB: Math.round(totalClassB * 10) / 10,
    totalClassC: Math.round(totalClassC * 10) / 10,
    totalWaste: Math.round(totalWaste * 10) / 10,
    avgBrix: Math.round(avgBrix * 10) / 10,
  };
}
