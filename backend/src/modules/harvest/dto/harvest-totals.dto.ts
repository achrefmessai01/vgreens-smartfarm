import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

// Derived totals for a single harvest, computed by HarvestService from the
// harvest's entries (+ parent batch for the yields). This is exactly what the
// omitted DB view would have produced; nothing here is stored on the harvest.
@ObjectType()
export class HarvestTotals {
  @Field(() => [Float], {
    description:
      'Per-quality sellable kg sums, positional and dynamic (index 0=A, 1=B, ...). As wide as the widest entry. The authoritative per-class breakdown.',
  })
  classKgs: number[];

  @Field(() => Float, {
    description:
      'classKgs[0] (Quality A). Convenience scalar for the first class.',
  })
  classA: number;

  @Field(() => Float, {
    description: 'classKgs[1] (Quality B), 0 if absent. Convenience scalar.',
  })
  classB: number;

  @Field(() => Float, {
    description: 'classKgs[2] (Quality C), 0 if absent. Convenience scalar.',
  })
  classC: number;

  @Field(() => Float, { description: 'SUM of entries.waste' })
  waste: number;

  @Field(() => Int, {
    description:
      'Total fruits SAMPLED: SUM of entries.sampleFruitCount. The number of fruits weighed across the samples, NOT an estimate of total fruits harvested.',
  })
  fruitCount: number;

  @Field(() => Float, { description: 'SUM of entry sellable kg' })
  totalFruitWeight: number;

  @Field(() => [Int], {
    nullable: true,
    description:
      'Per-quality SUM of crate counts, indexed 0=A,1=B,2=C. Null when the batch is not in crate mode.',
  })
  crateCounts: number[] | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Unweighted MEAN of per-entry avgFruitWeight (GRAMS per fruit). Null when no entry has a computable average.',
  })
  avgFruitWeight: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'Unweighted MEAN of per-entry avgBrix. Null when there are no entries.',
  })
  avgBrix: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'totalFruitWeight / batch.totalPlants. Null when totalPlants is 0/missing.',
  })
  yieldPerPlant: number | null;

  @Field(() => Float, {
    nullable: true,
    description:
      'totalFruitWeight / batch.rowLength. Null when rowLength is 0/missing.',
  })
  yieldPerMeter: number | null;
}
